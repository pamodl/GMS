import Trainer from '../models/trainer.model.js';
import Session from '../models/session.model.js';
import User from '../models/user.model.js';
import Notice from '../models/notice.model.js';

// Create new trainer profile
export const createTrainer = async (req, res) => {
  const { userId, specialization, experience, bio, certifications, hourlyRate, schedule, profileImage } = req.body;

  try {
    // Check if user exists and is not already a trainer
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if trainer profile already exists for this user
    const existingTrainer = await Trainer.findOne({ userId });
    if (existingTrainer) {
      return res.status(400).json({ message: 'Trainer profile already exists for this user' });
    }

    const newTrainer = new Trainer({
      userId,
      specialization,
      experience,
      bio,
      certifications,
      hourlyRate,
      schedule,
      profileImage
    });

    const savedTrainer = await newTrainer.save();
    res.status(201).json(savedTrainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all trainers
export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({ isActive: true })
      .populate('userId', 'username email regNumber')
      .select('-sessions');
    res.status(200).json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get trainer profile by user ID
export const getTrainerByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Looking for trainer with userId: ${userId}`);
    
    const trainer = await Trainer.findOne({ userId })
      .populate('userId', 'username email regNumber'); 
    
    if (!trainer) {
      console.log(`No trainer found for userId: ${userId}`);
      return res.status(404).json({ message: 'Trainer profile not found' });
    }
    
    console.log(`Found trainer: ${trainer._id}`);
    res.status(200).json(trainer);
  } catch (error) {
    console.error('Error fetching trainer by user ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get trainer by ID
export const getTrainerById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting trainer with id: ${id}`);
    
    const trainer = await Trainer.findById(id)
      .populate('userId', 'username email regNumber');
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    res.status(200).json(trainer);
  } catch (error) {
    console.error('Error getting trainer by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update trainer profile
export const updateTrainer = async (req, res) => {
  const { specialization, experience, bio, certifications, hourlyRate, schedule, profileImage, isActive } = req.body;
  
  try {
    const updatedTrainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      {
        specialization,
        experience,
        bio,
        certifications,
        hourlyRate,
        schedule,
        profileImage,
        isActive
      },
      { new: true }
    );

    if (!updatedTrainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    res.status(200).json(updatedTrainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a session booking
export const bookSession = async (req, res) => {
  const { trainerId, userId, date, startTime, endTime, sessionType, notes } = req.body;

  try {
    // Validate required fields
    if (!trainerId || !userId || !date || !startTime || !endTime || !sessionType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the trainer
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Parse the date properly
    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Create new session with 'pending' status
    const newSession = new Session({
      trainer: trainerId,
      user: userId,
      date: sessionDate,
      startTime,
      endTime,
      sessionType,
      notes,
      status: 'pending'  // Set initial status as pending
    });

    const savedSession = await newSession.save();

    try {
      // Get the user information for the notification
      const student = await User.findById(userId);
      const trainerUser = await User.findById(trainer.userId);
      
      if (!student || !trainerUser) {
        console.error('Could not find user or trainer for notifications');
      } else {
        // Format the date nicely for notifications
        const formattedDate = sessionDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Notify trainer about pending session request
        const newNotice = new Notice({
          title: `New Training Session Request`,
          message: `${student.username} has requested a ${sessionType} session on ${formattedDate} at ${startTime}. Please approve or decline this request.`,
          userId: trainer.userId,
          public: false,
        });
        await newNotice.save();
        
        // Notify student that request is pending
        const userNotice = new Notice({
          title: `Training Session Request Sent`,
          message: `Your ${sessionType} session request with trainer ${trainerUser.username} for ${formattedDate} at ${startTime} is pending approval.`,
          userId: userId,
          public: false,
        });
        await userNotice.save();
      }
    } catch (noticeError) {
      console.error('Error creating notifications:', noticeError);
    }

    // Add session to trainer's sessions with pending status
    trainer.sessions.push({
      userId,
      date: sessionDate,
      startTime,
      endTime,
      status: 'pending',  // Set as pending
      notes
    });

    await trainer.save();

    res.status(201).json({
      ...savedSession._doc,
      message: "Session request sent successfully! Waiting for trainer approval."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sessions for a trainer
export const getTrainerSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ trainer: req.params.trainerId })
      .populate('user', 'username email regNumber')
      .sort({ date: 1 });

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sessions for a user
export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.params.userId })
      .populate({
        path: 'trainer',
        select: 'userId specialization hourlyRate',
        populate: {
          path: 'userId',
          select: 'username'
        }
      })
      .sort({ date: 1 });

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update session status
export const updateSessionStatus = async (req, res) => {
  const { status } = req.body;
  
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    session.status = status;
    
    if (status === 'completed') {
      session.completedAt = new Date();
    }
    
    const updatedSession = await session.save();
    
    // Update the trainer's session record too
    const trainer = await Trainer.findById(session.trainer);
    if (trainer) {
      const trainerSessionIndex = trainer.sessions.findIndex(
        s => s._id.toString() === req.params.sessionId
      );
      
      if (trainerSessionIndex !== -1) {
        trainer.sessions[trainerSessionIndex].status = status;
        await trainer.save();
      }
    }
    
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add feedback for a completed session
export const addSessionFeedback = async (req, res) => {
  const { rating, comment } = req.body;
  
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Can only add feedback to completed sessions' });
    }
    
    if (session.feedback) {
      return res.status(400).json({ message: 'Feedback already provided for this session' });
    }
    
    session.feedback = {
      rating,
      comment,
      createdAt: new Date()
    };
    
    const updatedSession = await session.save();
    
    // Update trainer's overall rating
    const trainer = await Trainer.findById(session.trainer);
    if (trainer) {
      const newReviewCount = trainer.reviewCount + 1;
      const newRating = ((trainer.rating * trainer.reviewCount) + rating) / newReviewCount;
      
      trainer.rating = parseFloat(newRating.toFixed(1));
      trainer.reviewCount = newReviewCount;
      await trainer.save();
    }
    
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const checkTrainerStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const trainer = await Trainer.findOne({ userId });
    res.json({ isTrainer: !!trainer, trainerId: trainer?._id || null });
  } catch (error) {
    console.error('Error checking trainer status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add this to your trainer.controller.js file
export const debugTrainerSystem = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        details: `No user with ID ${userId}`
      });
    }
    
    // Check if trainer exists
    const trainer = await Trainer.findOne({ userId });
    
    // Get all trainers to see what's in the system
    const allTrainers = await Trainer.find().select('userId');
    
    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        regNumber: user.regNumber
      },
      isTrainer: !!trainer,
      trainer: trainer ? {
        id: trainer._id,
        specializations: trainer.specialization,
        hasSchedule: trainer.schedule && trainer.schedule.length > 0
      } : null,
      systemStatus: {
        totalTrainers: allTrainers.length,
        trainerIds: allTrainers.map(t => ({
          trainerId: t._id,
          userId: t.userId
        }))
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ message: error.message });
  }
};


export const approveSessionRequest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find the session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if session is in pending state
    if (session.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending sessions can be approved' });
    }
    
    // Update session status
    session.status = 'scheduled';
    await session.save();
    
    // Update trainer's session record too
    const trainer = await Trainer.findById(session.trainer);
    if (trainer) {
      const trainerSessionIndex = trainer.sessions.findIndex(
        s => s._id.toString() === sessionId
      );
      
      if (trainerSessionIndex !== -1) {
        trainer.sessions[trainerSessionIndex].status = 'scheduled';
        await trainer.save();
      }
    }
    
    // Send notifications
    try {
      const student = await User.findById(session.user);
      const trainerUser = await User.findById(trainer.userId);
      
      if (student && trainerUser) {
        const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Notify the student
        const userNotice = new Notice({
          title: `Training Session Confirmed`,
          message: `Your ${session.sessionType} session with trainer ${trainerUser.username} on ${formattedDate} at ${session.startTime} has been approved.`,
          userId: student._id,
          public: false,
        });
        await userNotice.save();
      }
    } catch (noticeError) {
      console.error('Error creating notification:', noticeError);
    }
    
    res.status(200).json({ message: 'Session approved successfully', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectSessionRequest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;
    
    // Find the session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if session is in pending state
    if (session.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending sessions can be rejected' });
    }
    
    // Update session status
    session.status = 'cancelled';
    session.notes = session.notes ? `${session.notes}\nRejection reason: ${reason || 'Not provided'}` : `Rejection reason: ${reason || 'Not provided'}`;
    await session.save();
    
    // Update trainer's session record too
    const trainer = await Trainer.findById(session.trainer);
    if (trainer) {
      const trainerSessionIndex = trainer.sessions.findIndex(
        s => s._id.toString() === sessionId
      );
      
      if (trainerSessionIndex !== -1) {
        trainer.sessions[trainerSessionIndex].status = 'cancelled';
        trainer.sessions[trainerSessionIndex].notes = session.notes;
        await trainer.save();
      }
    }
    
    // Send notification to student
    try {
      const student = await User.findById(session.user);
      const trainerUser = await User.findById(trainer.userId);
      
      if (student && trainerUser) {
        const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const userNotice = new Notice({
          title: `Training Session Rejected`,
          message: `Your ${session.sessionType} session with trainer ${trainerUser.username} on ${formattedDate} at ${session.startTime} was not approved.${reason ? ` Reason: ${reason}` : ''}`,
          userId: student._id,
          public: false,
        });
        await userNotice.save();
      }
    } catch (noticeError) {
      console.error('Error creating notification:', noticeError);
    }
    
    res.status(200).json({ message: 'Session request rejected', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateTrainerSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;
    
    console.log(`Updating schedule for trainer ID: ${id}`);
    
    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ message: 'Invalid schedule format' });
    }
    
    // Validate each schedule item
    for (const item of schedule) {
      if (!item.day || !item.startTime || !item.endTime || item.isAvailable === undefined) {
        return res.status(400).json({ 
          message: 'Each schedule item must have day, startTime, endTime, and isAvailable' 
        });
      }
    }
    
    const trainer = await Trainer.findById(id);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    trainer.schedule = schedule;
    await trainer.save();
    
    console.log('Schedule updated successfully');
    
    res.status(200).json({
      message: 'Schedule updated successfully',
      schedule: trainer.schedule
    });
  } catch (err) {
    console.error('Error updating trainer schedule:', err);
    res.status(500).json({ message: err.message });
  }
};