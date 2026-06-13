import 'server-only';
import QRCode from 'qrcode';

// Gerador de PIX "copia e cola" estático (BR Code EMV) com CRC16-CCITT.
// Docs: padrão EMV® QRCPS / Banco Central (Pix).

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// remove acentos e limita tamanho (campos EMV são ASCII)
function ascii(s: string, max: number): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7E]/g, '').trim().slice(0, max);
}

export function gerarPixCopiaECola(opts: {
  chave: string;
  nome: string;
  cidade: string;
  valorCents: number;
  txid?: string;
}): string {
  const nome = ascii(opts.nome || 'RECEBEDOR', 25) || 'RECEBEDOR';
  const cidade = ascii(opts.cidade || 'BRASIL', 15) || 'BRASIL';
  const txid = ascii(opts.txid || '***', 25) || '***';
  const valor = (opts.valorCents / 100).toFixed(2);

  const mai = tlv('00', 'br.gov.bcb.pix') + tlv('01', opts.chave.trim());
  const adf = tlv('05', txid);

  let payload =
    tlv('00', '01') + // payload format
    tlv('26', mai) + // merchant account info (pix)
    tlv('52', '0000') + // MCC
    tlv('53', '986') + // moeda BRL
    tlv('54', valor) + // valor
    tlv('58', 'BR') + // país
    tlv('59', nome) +
    tlv('60', cidade) +
    tlv('62', adf); // dados adicionais (txid)

  payload += '6304';
  return payload + crc16(payload);
}

// Gera o QR Code do PIX como SVG (string) — localmente, sem chamar serviço externo.
export async function gerarPixQrSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, {
    type: 'svg',
    margin: 1,
    width: 220,
    errorCorrectionLevel: 'M',
    color: { dark: '#075e54', light: '#ffffff' },
  });
}
