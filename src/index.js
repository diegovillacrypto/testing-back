import express  from 'express';
import { addWallet, addDailyValue, getDailyValuesForWallet, db } from './db.js';
import { PORT } from './config.js';

const app = express();
app.listen(PORT);
// Middleware para parsear JSON
app.use(express.json());



app.post('/recordWallet', async (req,res) => {
    const { wallet_address, fecha,valor } = req.body;
    const isRegistered = await db.oneOrNone('SELECT * FROM Wallets WHERE wallet_address = $1', wallet_address);
    try {
      if (isRegistered) {
        const newValue = await addDailyValue(wallet_address, fecha, valor);
        res.json(newValue);
    } else {
        const newWallet = await addWallet(wallet_address);
        const newValue = await addDailyValue(wallet_address, fecha, valor);
        res.json(newValue,newWallet);
    }
      
    } catch (error) {
      res.status(503).json({ error: error.message });
    }

});

app.get('/getWallet', async (req,res) => {
  const { wallet_address } = req.query; 
  try {
      const wallet = await db.one('SELECT wallet_id FROM Wallets WHERE wallet_address = $1', wallet_address);  
      const get = await getDailyValuesForWallet(wallet.wallet_id);
      res.json(get);
      res.json(wallet.wallet_id);
    } catch (error) {
      res.status(503).json({ error: error.message });
    }
});


/*

// Ruta para registrar una nueva billetera
app.post('/wallets', async (req, res) => {
  const { wallet_address } = req.body;
  try {
    const newWallet = await addWallet(wallet_address);
    res.json(newWallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para registrar un valor diario
app.post('/valores-diarios', async (req, res) => {
  const { wallet_address, fecha, valor } = req.body;
  try {
    const newValue = await addDailyValue(wallet_address, fecha, valor);
    res.json(newValue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

*/




