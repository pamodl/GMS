import Booking from '../models/booking.model.js';
import Equipment from '../models/equipment.model.js';

export const createBooking = async (req, res) => {
  const { userId, equipmentId, quantity } = req.body;

  try {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (equipment.available < quantity) {
      return res.status(400).json({ message: 'Not enough equipment available' });
    }

    const newBooking = new Booking({
      user: userId,
      equipment: equipmentId,
      quantity,
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'username email')
      .populate('equipment', 'name category');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'approved') {
      booking.approvedAt = new Date();

      // Update the equipment model
      const equipment = await Equipment.findById(booking.equipment);
      if (equipment) {
        equipment.available -= booking.quantity;
        equipment.borrowedBy.push({ userId: booking.user, quantity: booking.quantity });
        await equipment.save();
      }
    } else if (status === 'rejected') {
      booking.rejectedAt = new Date();
    }

    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch bookings for the specified user
    const bookings = await Booking.find({ user: userId })
      .populate('equipment', 'name category') // Populate equipment details
      .lean();

    // Format the response to include booking details
    const formattedBookings = bookings.map(booking => ({
      equipmentName: booking.equipment.name,
      category: booking.equipment.category,
      quantity: booking.quantity,
      status: booking.status,
      requestedAt: booking.requestedAt,
      approvedAt: booking.approvedAt,
      rejectedAt: booking.rejectedAt,
    }));

    res.status(200).json(formattedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    res.status(500).json({ message: error.message });
  }
};