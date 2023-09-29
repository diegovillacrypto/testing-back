import express  from 'express';
import { addWallet, addDailyValue, getDailyValuesForWallet, db } from './db.js';
import { PORT } from './config.js';
import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
	windowMs: 7 * 60 * 1000, // 7 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message : "Too many request"
})



const app = express();
app.use(limiter);

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
        res.json({newValue,newWallet});
    }
      
    } catch (error) {
      res.status(503).json({ error: error.message });
    }

});

app.get('/getWallet', async (req,res) => {
  const wallet_address = req.query;
  try {
      const wallet = await db.one('SELECT wallet_id FROM Wallets WHERE wallet_address = $1', wallet_address.wallet_address); 
      const get = await getDailyValuesForWallet(wallet.wallet_id);
      res.json(get);
    } catch (error) {
      res.status(503).json({ error: error.message });
    }
});

app.listen(PORT);



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




