import pgp from 'pg-promise';
import { DATABASE_URL } from '../src/config';

const db = pgp()(DATABASE_URL);

const addWallet = async (wallet_address) => {
  const query = 'INSERT INTO Wallets (wallet_address) VALUES ($1) RETURNING *';
  const values = [wallet_address];
  return await db.one(query, values);
};

const addDailyValue = async (wallet_address, fecha, valor) => {
      const wallet = await db.one('SELECT wallet_id FROM Wallets WHERE wallet_address = $1', wallet_address);  
      const insertedValue = await db.one('INSERT INTO ValoresDiarios (wallet_id, fecha, valor) VALUES ($1, $2, $3) RETURNING *', [wallet.wallet_id, fecha, valor]);
      return insertedValue;
  };

  const getDailyValuesForWallet = async (wallet_id) => {
    const query = 'SELECT * FROM ValoresDiarios WHERE wallet_id = $1';
    return await db.any(query, wallet_id);
  };
  


export { addWallet, addDailyValue, getDailyValuesForWallet, db};
