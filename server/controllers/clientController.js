import Client from '../models/Client.js'

// /**
//  * @swagger
//  * /api/clients:
//  *   get:
//  *     summary: Get all clients
//  *     tags: [Clients]
//  *     responses:
//  *       200:
//  *         description: List of clients
//  */
// exports.getClients = async (req, res) => {
//   try {
//     const clients = await Client.find();
//     res.json(clients);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// /**
//  * @swagger
//  * /api/clients:
//  *   post:
//  *     summary: Create a new client
//  *     tags: [Clients]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - name
//  *               - email
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               address:
//  *                 type: object
//  *                 properties:
//  *                   street:
//  *                     type: string
//  *                   city:
//  *                     type: string
//  *                   state:
//  *                     type: string
//  *                   zipCode:
//  *                     type: string
//  *                   country:
//  *                     type: string
//  */
// exports.createClient = async (req, res) => {
//   const client = new Client(req.body);
//   try {
//     const newClient = await client.save();
//     res.status(201).json(newClient);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// /**
//  * @swagger
//  * /api/clients/{id}:
//  *   put:
//  *     summary: Update a client
//  *     tags: [Clients]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  */
// exports.updateClient = async (req, res) => {
//   try {
//     const client = await Client.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }
//     res.json(client);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// /**
//  * @swagger
//  * /api/clients/{id}:
//  *   delete:
//  *     summary: Delete a client
//  *     tags: [Clients]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  */
// exports.deleteClient = async (req, res) => {
//   try {
//     const client = await Client.findByIdAndDelete(req.params.id);
//     if (!client) {
//       return res.status(404).json({ message: 'Client not found' });
//     }
//     res.json({ message: 'Client deleted' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Get all clients
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new client
export const createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a client
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a client
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
