'use client';

import { useState } from 'react';
import { createEntry, updateEntry, toggleStatus, deleteEntry, deleteGroup } from './actions';

type Entry = {
  id: string; tipo: 'RECEBER' | 'PAGAR'; descricao: string; categoria: string | null;
  valorCents: number; vencimento: string; status: string; grupoId: string | null;
  parcelaNum: number; parcelasTotal: number; recorrente: boolean;
};

const brl = (c: number) => 'R$ ' + (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const dt = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');
const isoDate = (iso: string) => new Date(iso).toISOString().slice(0, 10);

function EntryForm({ tipoDefault, editing, onDone }: { tipoDefault: 'RECEBER' | 'PAGAR'; editing?: Entry; onDone: () => void }) {
  const [modo, setModo] = useState<'avista' | 'parcelado' | 'recorrente'>('avista');
  const isEdit = !!editing;

  return (
    <form
      action={async (fd) => { if (isEdit) await updateEntry(fd); else await createEntry(fd); onDone(); }}
      className="space-y-3"
    >
      {isEdit && <input type="hidden" name="id" value={editing!.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Tipo</label>
          {isEdit ? (
            <p className="text-sm">{editing!.tipo === 'RECEBER' ? 'Conta a receber' : 'Conta a pagar'}</p>
          ) : (
            <select name="tipo" defaultValue={tipoDefault} className="input">
              <option value="RECEBER">Conta a receber (entrada)</option>
              <option value="PAGAR">Conta a pagar (saída)</option>
            </select>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="label">Descrição *</label>
          <input name="descricao" required defaultValue={editing?.descricao} className="input" placeholder="Ex.: Mensalidade cliente X / Aluguel / Google Ads" />
        </div>
        <div>
          <label className="label">Valor (R$) *</label>
          <input name="valor" required defaultValue={editing ? (editing.valorCents / 100).toFixed(2) : ''} className="input" placeholder="1500,00" inputMode="decimal" />
        </div>
        <div>
          <label className="label">Vencimento *</label>
          <input name="vencimento" type="date" required defaultValue={editing ? isoDate(editing.vencimento) : ''} className="input" />
        </div>
        <div>
          <label className="label">Categoria</label>
          <input name="categoria" defaultValue={editing?.categoria ?? ''} className="input" placeholder="Ex.: Serviços, Mídia, Folha" />
        </div>
        {isEdit ? (
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue={editing!.status} className="input">
              <option value="PENDENTE">Pendente</option>
              <option value="QUITADO">Quitado</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="label">Forma</label>
            <select name="modo" value={modo} onChange={(e) => setModo(e.target.value as any)} className="input">
              <option value="avista">À vista</option>
              <option value="parcelado">Parcelado</option>
              <option value="recorrente">Recorrente (mensal)</option>
            </select>
          </div>
        )}
        {!isEdit && modo === 'parcelado' && (
          <div className="sm:col-span-2">
            <label className="label">Nº de parcelas</label>
            <input name="parcelas" type="number" min={2} max={120} defaultValue={2} className="input" />
            <p className="mt-1 text-xs text-muted">O valor informado é o TOTAL — será dividido nas parcelas, uma por mês.</p>
          </div>
        )}
        {!isEdit && modo === 'recorrente' && (
          <div className="sm:col-span-2">
            <label className="label">Repetir por quantos meses</label>
            <input name="meses" type="number" min={2} max={120} defaultValue={12} className="input" />
            <p className="mt-1 text-xs text-muted">O valor informado se repete a cada mês pelo período escolhido.</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn">{isEdit ? 'Salvar' : 'Cadastrar'}</button>
        <button type="button" className="btn-ghost" onClick={onDone}>Cancelar</button>
      </div>
    </form>
  );
}

function EntryRow({ e, onEdit }: { e: Entry; onEdit: (e: Entry) => void }) {
  const vencido = e.status === 'PENDENTE' && new Date(e.vencimento) < new Date();
  return (
    <tr className="border-b border-line/60">
      <td className="py-2 pr-3">
        <p className="font-medium">{e.descricao}</p>
        <p className="text-xs text-muted">
          {e.categoria ?? 'Sem categoria'}
          {e.parcelasTotal > 1 && <span className="chip ml-2">{e.recorrente ? 'recorrente' : `${e.parcelaNum}/${e.parcelasTotal}`}</span>}
        </p>
      </td>
      <td className="py-2 pr-3 text-right font-mono-data">{brl(e.valorCents)}</td>
      <td className={`py-2 pr-3 text-center text-xs ${vencido ? 'text-red-400' : 'text-slate-300'}`}>{dt(e.vencimento)}{vencido && ' ⚠'}</td>
      <td className="py-2 pr-3 text-center">
        <form action={toggleStatus} className="inline">
          <input type="hidden" name="id" value={e.id} />
          <button className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${e.status === 'QUITADO' ? 'border-accent2/40 bg-accent2/10 text-accent2' : 'border-gold/40 bg-gold/10 text-gold'}`}>
            {e.status === 'QUITADO' ? 'Quitado' : 'Pendente'}
          </button>
        </form>
      </td>
      <td className="py-2 text-right whitespace-nowrap">
        <button onClick={() => onEdit(e)} className="text-xs text-accent hover:underline">editar</button>
        <form action={deleteEntry} className="inline">
          <input type="hidden" name="id" value={e.id} />
          <button className="ml-2 text-xs text-red-400 hover:underline">excluir</button>
        </form>
        {e.grupoId && (
          <form action={deleteGroup} className="inline">
            <input type="hidden" name="grupoId" value={e.grupoId} />
            <button className="ml-2 text-xs text-red-400/70 hover:underline" title="Excluir todas as parcelas/recorrências deste grupo">grupo</button>
          </form>
        )}
      </td>
    </tr>
  );
}

function List({ titulo, cor, entries, onEdit }: { titulo: string; cor: string; entries: Entry[]; onEdit: (e: Entry) => void }) {
  return (
    <div className="card">
      <h2 className="mb-3 font-semibold" style={{ color: cor }}>{titulo} <span className="text-xs text-muted">({entries.length})</span></h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">Nenhum registro.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[10px] uppercase tracking-wide text-muted">
                <th className="py-1.5 pr-3">Descrição</th><th className="py-1.5 pr-3 text-right">Valor</th>
                <th className="py-1.5 pr-3 text-center">Vencimento</th><th className="py-1.5 pr-3 text-center">Status</th><th className="py-1.5"></th>
              </tr>
            </thead>
            <tbody>{entries.map((e) => <EntryRow key={e.id} e={e} onEdit={onEdit} />)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function FinanceUI({ entries }: { entries: Entry[] }) {
  const [modal, setModal] = useState<null | { tipo: 'RECEBER' | 'PAGAR'; editing?: Entry }>(null);
  const receber = entries.filter((e) => e.tipo === 'RECEBER');
  const pagar = entries.filter((e) => e.tipo === 'PAGAR');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button className="btn" onClick={() => setModal({ tipo: 'RECEBER' })}>+ Conta a receber</button>
        <button className="btn-ghost" onClick={() => setModal({ tipo: 'PAGAR' })}>+ Conta a pagar</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <List titulo="Contas a Receber" cor="#34d399" entries={receber} onEdit={(e) => setModal({ tipo: e.tipo, editing: e })} />
        <List titulo="Contas a Pagar" cor="#f87171" entries={pagar} onEdit={(e) => setModal({ tipo: e.tipo, editing: e })} />
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="card w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 font-semibold">{modal.editing ? 'Editar registro' : modal.tipo === 'RECEBER' ? 'Nova conta a receber' : 'Nova conta a pagar'}</h3>
            <EntryForm tipoDefault={modal.tipo} editing={modal.editing} onDone={() => setModal(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
