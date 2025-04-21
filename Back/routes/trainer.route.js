import express from 'express';
import {
  createTrainer,
  getAllTrainers,
  getTrainerByUserId,  
  updateTrainer,
  bookSession,
  getTrainerSessions,
  getUserSessions,
  updateSessionStatus,
  addSessionFeedback,
  checkTrainerStatus,
  approveSessionRequest,
  rejectSessionRequest,
  updateTrainerSchedule,
  deleteTrainer,
  cancelAllTrainerSessions,
  cancelScheduledSession,
} from '../controllers/trainer.controller.js';
import Trainer from '../models/trainer.model.js'; 

const router = express.Router();

// Trainer routes
router.post('/create', createTrainer);
router.get('/', getAllTrainers);
router.get('/user/:userId', getTrainerByUserId); 
router.get('/:id', async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('userId', 'username email regNumber');
    
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put('/:id', updateTrainer);

// Session routes
router.post('/session/book', bookSession);
router.get('/sessions/:trainerId', getTrainerSessions);
router.get('/user/sessions/:userId', getUserSessions);
router.put('/session/:sessionId/status', updateSessionStatus);
router.post('/session/:sessionId/feedback', addSessionFeedback);
router.get('/check/:userId', checkTrainerStatus);
router.put('/session/:sessionId/approve', approveSessionRequest);
router.put('/session/:sessionId/reject', rejectSessionRequest);
router.put('/:id/schedule', updateTrainerSchedule);
router.delete('/:id', deleteTrainer);
router.post('/cancel-all-sessions/:trainerId', cancelAllTrainerSessions);
router.put('/session/:sessionId/cancel', cancelScheduledSession);

export default router;