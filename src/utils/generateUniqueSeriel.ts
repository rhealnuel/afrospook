import Transaction from "@/models/Transactions";

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateSerial(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return result;
}

export async function generateUniqueSerial(): Promise<string> {
  let serial = '';
  let exists = true;

  while (exists) {
    serial = generateSerial();
    const existing = await Transaction.findOne({ serial });
    exists = !!existing;
  }

  return serial;
}
