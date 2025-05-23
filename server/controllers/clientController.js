import Client from '../models/Clients.js'

exports.createClient = async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const client = new Client({ user: req.user.id, name, email, phone, address });
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user.id });
    res.json(clients);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Implement updateClient and deleteClient similarly
