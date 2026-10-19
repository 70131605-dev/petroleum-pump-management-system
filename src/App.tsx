import { useMemo, useState } from "react";

type Nozzle = { id: string; fuel: string; opening: number; closing: number; rate: number };

const initialNozzles: Nozzle[] = [
  { id: "HSD-1", fuel: "Diesel", opening: 1000, closing: 1200, rate: 250 },
  { id: "HSD-2", fuel: "Diesel", opening: 2000, closing: 2200, rate: 250 },
  { id: "SUPER-1", fuel: "Petrol", opening: 3000, closing: 3300, rate: 250 },
  { id: "SUPER-2", fuel: "Petrol", opening: 4000, closing: 4300, rate: 250 },
];

const nav = [
  "Dashboard", "Daily Register", "Shifts & Handover", "Meter Readings", "Fuel Rates",
  "Customers & Vehicles", "Credit & Recoveries", "Fuel Purchases", "Fuel Receiving",
  "Tanks & Stock", "Suppliers", "Lubricants", "Expenses", "Cash & Bank", "Reports",
  "Users & Permissions", "Audit & Backup", "Settings",
];

const money = (value: number) => `PKR ${value.toLocaleString("en-PK")}`;
const litres = (value: number) => `${value.toLocaleString("en-PK")} L`;

function Stat({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return (
    <article className={`stat ${tone}`}>
      <div className="stat-mark" aria-hidden="true" />
      <div><p>{label}</p><strong>{value}</strong><small>{note}</small></div>
    </article>
  );
}

function Section({ title, action, children, className = "" }: { title: string; action?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-head"><h2>{title}</h2>{action && <button className="text-button">{action}</button>}</header>
      {children}
    </section>
  );
}


type PageDef = { title: string; subtitle: string; fields: string[]; columns: string[]; rows: (string | number)[][] };

const pages: Record<string, PageDef> = {
  "Daily Register": { title: "Daily Register", subtitle: "Consolidated day book of all shifts", fields: ["Date", "Shift", "Entry type", "Amount"], columns: ["Time", "Shift", "Entry", "Debit", "Credit", "Balance"], rows: [["08:00", "Morning", "Opening cash", "10,000", "", "10,000"], ["14:00", "Morning", "Fuel cash sales", "185,000", "", "195,000"], ["15:10", "Evening", "Recovery - ABC Transport", "20,000", "", "215,000"], ["18:30", "Evening", "Generator diesel expense", "", "5,000", "210,000"], ["21:00", "Evening", "Bank deposit - HBL", "", "160,000", "50,000"]] },
  "Shifts & Handover": { title: "Shifts & Handover", subtitle: "Open, close and hand over shifts", fields: ["Shift", "Operator", "Opening cash", "Start time"], columns: ["Shift", "Operator", "Start", "End", "Status", "Handover"], rows: [["Morning", "Usman Ali", "06:00", "14:00", "Closed", "PKR 10,000"], ["Evening", "Ali Raza", "14:00", "-", "Open", "Pending"], ["Night", "Bilal Khan", "-", "-", "Scheduled", "-"]] },
  "Meter Readings": { title: "Meter Readings", subtitle: "Cumulative nozzle meter entries", fields: ["Nozzle", "Opening reading", "Closing reading", "Testing litres"], columns: ["Nozzle", "Fuel", "Opening", "Closing", "Sold L", "Operator"], rows: initialNozzles.map((n) => [n.id, n.fuel, n.opening, n.closing, n.closing - n.opening, "Ali Raza"]) },
  "Fuel Rates": { title: "Fuel Rates", subtitle: "Effective-dated selling and purchase rates", fields: ["Fuel", "Selling rate", "Purchase rate", "Effective from"], columns: ["Fuel", "Selling rate", "Purchase rate", "Effective from", "Status"], rows: [["Petrol", "250.00", "238.50", "16 Oct 2026 00:00", "Active"], ["Diesel", "250.00", "240.10", "16 Oct 2026 00:00", "Active"], ["Petrol", "255.00", "243.00", "01 Oct 2026 00:00", "Expired"]] },
  "Customers & Vehicles": { title: "Customers & Vehicles", subtitle: "Credit customers and registered vehicles", fields: ["Customer name", "Phone", "Credit limit", "Vehicle no."], columns: ["Customer", "Phone", "Vehicles", "Credit limit", "Balance"], rows: [["ABC Transport", "0300-1234567", "LES-4521, LEA-998", "200,000", "20,000"], ["Khan Goods", "0321-7654321", "TKA-112", "100,000", "45,500"], ["City Rickshaw Union", "0333-1112223", "12 vehicles", "50,000", "8,200"]] },
  "Credit & Recoveries": { title: "Credit & Recoveries", subtitle: "Credit sales and customer payments", fields: ["Customer", "Type", "Amount", "Reference"], columns: ["Date", "Customer", "Type", "Litres", "Amount", "Balance"], rows: [["18 Oct", "ABC Transport", "Credit sale", "160", "40,000", "60,000"], ["18 Oct", "ABC Transport", "Recovery", "-", "20,000", "40,000"], ["17 Oct", "Khan Goods", "Credit sale", "80", "20,000", "45,500"]] },
  "Fuel Purchases": { title: "Fuel Purchases", subtitle: "Supplier invoices for fuel", fields: ["Supplier", "Invoice no.", "Fuel", "Quantity L", "Rate"], columns: ["Invoice", "Supplier", "Fuel", "Quantity", "Rate", "Amount", "Status"], rows: [["AP-78236", "Attock Petroleum", "Diesel", "10,000", "240.10", "2,401,000", "Received"], ["PSO-5521", "PSO", "Petrol", "8,000", "238.50", "1,908,000", "In transit"]] },
  "Fuel Receiving": { title: "Fuel Receiving", subtitle: "Tank decantation, dip and shortage", fields: ["Invoice", "Tank", "Dip before", "Dip after", "Accepted L"], columns: ["Receipt", "Invoice", "Tank", "Billed", "Accepted", "Shortage"], rows: [["FR-1026", "AP-78236", "T-2 Diesel", "10,000", "9,950", "50"], ["FR-1025", "PSO-5490", "T-1 Petrol", "8,000", "7,985", "15"]] },
  "Tanks & Stock": { title: "Tanks & Stock", subtitle: "Book stock vs physical dip", fields: ["Tank", "Dip (cm)", "Physical litres", "Date"], columns: ["Tank", "Fuel", "Capacity", "Book stock", "Dip stock", "Variance"], rows: [["T-1", "Petrol", "20,000", "12,450", "12,410", "-40"], ["T-2", "Diesel", "25,000", "8,250", "8,262", "+12"]] },
  Suppliers: { title: "Suppliers", subtitle: "Supplier accounts and payables", fields: ["Supplier name", "Contact", "Opening balance"], columns: ["Supplier", "Contact", "Purchases", "Paid", "Payable"], rows: [["Attock Petroleum", "042-111-222", "2,401,000", "2,000,000", "401,000"], ["PSO", "042-333-444", "1,908,000", "1,908,000", "0"]] },
  Lubricants: { title: "Lubricants", subtitle: "Oil and lubricant inventory and sales", fields: ["Product", "Quantity", "Rate", "Type"], columns: ["Product", "Unit", "Stock", "Cost", "Sale rate", "Sold today"], rows: [["Shell Helix 4L", "Can", "24", "5,200", "5,800", "3"], ["Total Quartz 1L", "Bottle", "60", "1,350", "1,550", "7"]] },
  Expenses: { title: "Expenses", subtitle: "Station and shift expenses", fields: ["Category", "Amount", "Paid from", "Description"], columns: ["Date", "Shift", "Category", "Description", "Amount"], rows: [["18 Oct", "Evening", "Fuel", "Generator diesel", "5,000"], ["18 Oct", "Morning", "Staff", "Tea & meals", "1,200"], ["17 Oct", "Night", "Utilities", "Electricity bill", "18,500"]] },
  "Cash & Bank": { title: "Cash & Bank", subtitle: "Cash in hand, bank and card clearing", fields: ["Account", "Type", "Amount", "Reference"], columns: ["Account", "Type", "Opening", "In", "Out", "Balance"], rows: [["Cash in hand", "Cash", "10,000", "205,000", "165,000", "50,000"], ["HBL Current", "Bank", "1,250,000", "160,000", "0", "1,410,000"], ["Card clearing", "Clearing", "0", "30,000", "0", "30,000"]] },
  Reports: { title: "Reports", subtitle: "Printable, PDF and CSV reports", fields: ["Report", "From", "To", "Format"], columns: ["Report", "Period", "Format", "Generated"], rows: [["Daily register", "18 Oct 2026", "PDF", "10:32 PM"], ["Stock ledger", "Oct 2026", "CSV", "10:15 PM"], ["Profit & loss", "Oct 2026", "PDF", "09:50 PM"]] },
  "Users & Permissions": { title: "Users & Permissions", subtitle: "Role-based access control", fields: ["Name", "Username", "Role"], columns: ["User", "Role", "Permissions", "Status"], rows: [["Admin", "Owner", "All", "Active"], ["Ahmed Manager", "Manager", "Approve, reports, rates", "Active"], ["Ali Raza", "Operator", "Shift, readings, sales", "Active"]] },
  "Audit & Backup": { title: "Audit & Backup", subtitle: "Immutable audit trail and backups", fields: ["Backup note"], columns: ["Time", "User", "Action", "Record"], rows: [["22:30", "System", "Backup completed", "db-2026-10-18.sql"], ["21:05", "Ali Raza", "Posted bank deposit", "BD-301"], ["15:10", "Ali Raza", "Posted recovery", "RC-882"]] },
  Settings: { title: "Settings", subtitle: "Station, tanks, nozzles and preferences", fields: ["Station name", "Address", "NTN", "Currency"], columns: ["Setting", "Value"], rows: [["Station", "Main Pump"], ["Currency", "PKR"], ["Decimal precision", "2 (money) / 3 (litres)"], ["Shifts per day", "3"]] },
};

function ModulePage({ page, onSave }: { page: PageDef; onSave: (msg: string) => void }) {
  const [rows, setRows] = useState(page.rows);
  const [form, setForm] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const filtered = rows.filter((r) => r.join(" ").toLowerCase().includes(query.toLowerCase()));
  function save() {
    if (!page.fields.some((f) => form[f])) return onSave("Please fill in the form first.");
    setRows((r) => [page.columns.map((_, i) => form[page.fields[i]] ?? "-"), ...r]);
    setForm({});
    onSave(`${page.title}: entry saved.`);
  }
  return (
    <>
      <div className="title-row"><div><p className="eyebrow">{page.subtitle}</p><h1>{page.title}</h1></div></div>
      <div className="bottom-grid">
        <Section title="New entry">
          <div className="form-grid">{page.fields.map((f) => <label key={f}>{f}<input value={form[f] ?? ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} /></label>)}</div>
          <button className="primary full" onClick={save}>Save entry</button>
        </Section>
        <Section title={`${page.title} records`} className="meters" >
          <div className="form-grid"><label>Search<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search records" /></label></div>
          <div className="table-wrap"><table>
            <thead><tr>{page.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{filtered.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{j === 0 ? <strong>{c}</strong> : c}</td>)}</tr>)}</tbody>
          </table></div>
        </Section>
      </div>
    </>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [nozzles, setNozzles] = useState<Nozzle[]>(initialNozzles);
  const [date, setDate] = useState("2026-10-18");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(false);
  const [cash, setCash] = useState({ opening: 10000, recovery: 20000, expense: 5000, deposit: 160000, counted: 45000 });
  const [tank, setTank] = useState({ petrol: 12450, diesel: 8250 });

  const totals = useMemo(() => {
    const rows = nozzles.map((n) => ({ ...n, sold: n.closing - n.opening, amount: (n.closing - n.opening) * n.rate }));
    const fuelSales = rows.reduce((sum, n) => sum + n.amount, 0);
    return { rows, fuelSales, cashSales: fuelSales - 70000, credit: 40000, card: 30000 };
  }, [nozzles]);
  const expectedCash = cash.opening + totals.cashSales + cash.recovery - cash.expense - cash.deposit;
  const difference = cash.counted - expectedCash;

  function postAction(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  function receiveFuel() {
    setTank((current) => ({ ...current, diesel: current.diesel + 9950 }));
    postAction("Receipt FR-1026 posted: 9,950 L added to Diesel Tank T-2; 50 L shortage recorded.");
  }

  return (
    <div className="app-shell">
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand"><span className="brand-icon">P</span><div><strong>PETROLEUM</strong><small>Operations · Inventory · Accounts</small></div></div>
        <nav aria-label="Primary navigation">
          {nav.map((item) => <button key={item} onClick={() => { setActiveNav(item); setMenuOpen(false); window.scrollTo(0, 0); }} className={activeNav === item ? "active" : ""}><span className="nav-dot" />{item}</button>)}
        </nav>
        <div className="system-state"><span /> System operational<small>Last backup: 10:30 PM</small></div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="menu-toggle" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><span /><span /><span /></button>
          <div className="mobile-brand"><strong>PMS</strong><small>{activeNav}</small></div>
          <label>Branch<select><option>Main Pump</option></select></label>
          <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label>Active shift<select><option>Evening · Open</option><option>Morning · Closed</option></select></label>
          <div className="operator"><span>AR</span><div><strong>Ali Raza</strong><small>Operator</small></div></div>
          <button className="primary" onClick={() => window.print()}>Print report</button>
        </header>

        <main>
          {notice && <div className="toast" role="status">{notice}</div>}
          {activeNav !== "Dashboard" && pages[activeNav] ? <ModulePage key={activeNav} page={pages[activeNav]} onSave={postAction} /> : <>
          <div className="title-row"><div><p className="eyebrow">{activeNav}</p><h1>Daily Operations Overview</h1></div><span className="live"><i /> Provisional · shift open</span></div>

          <div className="stats">
            <Stat label="Fuel sales" value={money(totals.fuelSales)} note={`${litres(totals.rows.reduce((s, n) => s + n.sold, 0))} dispensed`} tone="green" />
            <Stat label="Cash sales" value={money(totals.cashSales)} note={`${Math.round(totals.cashSales / totals.fuelSales * 100)}% of fuel sales`} tone="blue" />
            <Stat label="Credit sales" value={money(totals.credit)} note="Allocated to customers" tone="amber" />
            <Stat label="Bank / Card" value={money(totals.card)} note="Card clearing account" tone="violet" />
            <Stat label="Recoveries" value={money(cash.recovery)} note="Previous customer credit" tone="mint" />
            <Stat label="Expenses" value={money(cash.expense)} note="Station expenses" tone="red" />
          </div>

          <div className="grid-main">
            <Section title="Nozzle meter readings" action={editing ? "Finish editing" : "Edit readings"} className="meters">
              <div className="table-wrap"><table>
                <thead><tr><th>Nozzle</th><th>Opening L</th><th>Closing L</th><th>Sold L</th><th>Rate</th><th>Amount</th></tr></thead>
                <tbody>
                  {totals.rows.map((n, index) => <tr key={n.id}><td><strong>{n.id}</strong><small>{n.fuel}</small></td><td>{n.opening.toLocaleString()}</td><td>{editing ? <input aria-label={`${n.id} closing`} type="number" value={n.closing} onChange={(e) => setNozzles((items) => items.map((item, i) => i === index ? { ...item, closing: Number(e.target.value) } : item))} /> : n.closing.toLocaleString()}</td><td>{n.sold.toLocaleString()}</td><td>{money(n.rate).replace("PKR ", "")}</td><td><strong>{money(n.amount).replace("PKR ", "")}</strong></td></tr>)}
                </tbody>
                <tfoot><tr><td colSpan={3}>Total</td><td>{totals.rows.reduce((s, n) => s + n.sold, 0).toLocaleString()}</td><td /><td>{money(totals.fuelSales).replace("PKR ", "")}</td></tr></tfoot>
              </table></div>
              <div className="edit-footer"><button className="secondary" onClick={() => setEditing(!editing)}>{editing ? "Save meter readings" : "Update readings"}</button><small>Sales calculate from cumulative meter differences. Negative consumption is blocked at posting.</small></div>
            </Section>

            <Section title="Tank stock" action="View stock ledger">
              {[{ name: "Petrol", value: tank.petrol, cap: 20000 }, { name: "Diesel", value: tank.diesel, cap: 25000 }].map((item) => <div className="tank" key={item.name}><div className="tank-row"><strong>{item.name}</strong><span>{litres(item.value)} <small>/ {litres(item.cap)}</small></span><b>{Math.round(item.value / item.cap * 100)}%</b></div><div className="bar"><span style={{ width: `${Math.min(100, item.value / item.cap * 100)}%` }} /></div><small>Book stock · updated from posted movements</small></div>)}
            </Section>
          </div>

          <div className="quickbar">
            <div><strong>Evening shift</strong><small>Ali Raza · started 02:00 PM</small></div>
            <button onClick={() => postAction("Shift opening validated. All four nozzles are assigned.")}>Open shift</button>
            <button onClick={() => postAction("Credit allocation draft opened for ABC Transport.")}>Add credit sale</button>
            <button onClick={() => setCash((c) => ({ ...c, recovery: c.recovery + 5000 }))}>Receive PKR 5,000</button>
            <button onClick={receiveFuel}>Post fuel receipt</button>
            <button onClick={() => setCash((c) => ({ ...c, expense: c.expense + 1000 }))}>Add PKR 1,000 expense</button>
            <button className="danger" onClick={() => postAction(difference === 0 ? "Shift is balanced and ready for manager approval." : "Closing blocked: explain the cash difference first.")}>Close shift</button>
          </div>

          <div className="bottom-grid">
            <Section title="Shift closing & handover" className="closing">
              <dl>
                <div><dt>Opening cash</dt><dd>{money(cash.opening)}</dd></div>
                <div><dt>Cash sales (this shift)</dt><dd>{money(totals.cashSales)}</dd></div>
                <div><dt>Cash recoveries</dt><dd>{money(cash.recovery)}</dd></div>
                <div><dt>Expenses</dt><dd>− {money(cash.expense)}</dd></div>
                <div><dt>Bank deposit</dt><dd>− {money(cash.deposit)}</dd></div>
                <div className="highlight"><dt>Expected cash in hand</dt><dd>{money(expectedCash)}</dd></div>
                <div><dt>Counted cash</dt><dd><input aria-label="Counted cash" type="number" value={cash.counted} onChange={(e) => setCash({ ...cash, counted: Number(e.target.value) })} /></dd></div>
                <div className={difference === 0 ? "success" : "warning"}><dt>Difference</dt><dd>{money(difference)}</dd></div>
                <div><dt>Office transfer</dt><dd>PKR 40,000</dd></div>
                <div><dt>Next shift handover</dt><dd>PKR 5,000</dd></div>
              </dl>
              <button className="primary full" onClick={() => postAction("Handover offered: PKR 5,000. Awaiting incoming operator acceptance.")}>Confirm handover</button>
            </Section>

            <Section title="Purchases, receiving & ledgers">
              <div className="tabs"><button className="selected">Fuel</button><button>Suppliers</button><button>Lubricants</button></div>
              <div className="form-grid"><label>Supplier<select><option>Attock Petroleum (Pvt) Ltd</option></select></label><label>Invoice<input value="AP-78236" readOnly /></label><label>Tank<select><option>Diesel Tank (T-2)</option></select></label></div>
              <div className="receipt-numbers"><div><small>Billed quantity</small><strong>10,000 L</strong></div><div><small>Accepted quantity</small><strong>9,950 L</strong></div><div><small>Shortage</small><strong className="negative">50 L</strong></div></div>
              <button className="primary full" onClick={receiveFuel}>Post receipt atomically</button>
              <div className="ledger"><div><strong>ABC Transport</strong><span>Credit 40,000</span><span>Received 20,000</span><b>Due 20,000</b></div></div>
            </Section>

            <Section title="Daily reports & controls">
              <div className="report-grid">{["Daily register", "Shift report", "Stock ledger", "Customer ledger", "Supplier ledger", "Profit & loss", "Cashbook", "Audit log"].map((r) => <button key={r} onClick={() => postAction(`${r} prepared for ${date}.`)}>{r}</button>)}</div>
              <div className="approval"><span>✓</span><div><strong>Manager approval</strong><small>Shift closing approval is pending</small></div></div>
              <div className="audit"><strong>System & audit</strong><p><span className="ok-dot" /> Last backup successful <small>18 Oct 2026, 10:30 PM</small></p><p>42 immutable audit events today</p></div>
            </Section>
          </div>
          </>}
        </main>
      </div>
    </div>
  );
}
