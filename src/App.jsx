import React, { useMemo, useState } from "react";
import { Plus, Trash2, Calculator, TrendingUp, AlertTriangle, CheckCircle2, TreePine } from "lucide-react";

const crc = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const complexityOptions = {
  A: { label: "A · Simple / repetible", multiplier: 1 },
  B: { label: "B · Semi personalizado", multiplier: 1.3 },
  C: { label: "C · Personalizado complejo", multiplier: 1.7 },
  D: { label: "D · Artístico / riesgoso", multiplier: 2.3 },
};

const productTypes = {
  volumen: {
    label: "Producto pequeño / volumen",
    minMargin: 40,
    suggestedMargin: 55,
    suggestedWaste: 10,
  },
  premium: {
    label: "Producto premium",
    minMargin: 70,
    suggestedMargin: 100,
    suggestedWaste: 18,
  },
  artistico: {
    label: "Artístico / único",
    minMargin: 120,
    suggestedMargin: 180,
    suggestedWaste: 28,
  },
  b2b: {
    label: "B2B corporativo",
    minMargin: 60,
    suggestedMargin: 85,
    suggestedWaste: 12,
  },
};

const initialProducts = [
  {
    id: 1,
    name: "Mesa madera exótica",
    type: "premium",
    materialCost: 225000,
    wastePercent: 20,
    laborHours: 8,
    complexity: "C",
    marginPercent: 100,
    marketPrice: 900000,
  },
  {
    id: 2,
    name: "Abre chapas personalizado",
    type: "volumen",
    materialCost: 2500,
    wastePercent: productTypes.premium.suggestedWaste,
    laborHours: 0.35,
    complexity: "B",
    marginPercent: 55,
    marketPrice: 12000,
  },
];

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateProduct(product, hourlyRate, exchangeRate) {
  const safeExchangeRate = exchangeRate > 0 ? exchangeRate : 1;
  const materialWithWaste = product.materialCost * (1 + product.wastePercent / 100);
  const laborCost = product.laborHours * hourlyRate;
  const baseCost = materialWithWaste + laborCost;
  const complexityMultiplier = complexityOptions[product.complexity]?.multiplier || 1;
  const adjustedCost = baseCost * complexityMultiplier;
  const suggestedPrice = adjustedCost * (1 + product.marginPercent / 100);
  const profit = suggestedPrice - adjustedCost;
  const grossMargin = suggestedPrice > 0 ? (profit / suggestedPrice) * 100 : 0;
  const marketGap = product.marketPrice > 0 ? suggestedPrice - product.marketPrice : 0;
  const suggestedUsd = suggestedPrice / safeExchangeRate;

  return {
    materialWithWaste,
    laborCost,
    baseCost,
    adjustedCost,
    suggestedPrice,
    suggestedUsd,
    profit,
    grossMargin,
    marketGap,
  };
}

export default function NaosPricingDashboard() {
  const [monthlyExpenses, setMonthlyExpenses] = useState(3000000);
  const [productiveHours, setProductiveHours] = useState(160);
  const [exchangeRate, setExchangeRate] = useState(510);
  const [products, setProducts] = useState(initialProducts);

  const hourlyRate = useMemo(() => {
    if (!productiveHours) return 0;
    return monthlyExpenses / productiveHours;
  }, [monthlyExpenses, productiveHours]);

  const productCalculations = useMemo(() => {
    return products.map((product) => ({
      ...product,
      calc: calculateProduct(product, hourlyRate, exchangeRate),
    }));
  }, [products, hourlyRate, exchangeRate]);

  const totals = useMemo(() => {
    return productCalculations.reduce(
      (acc, product) => {
        acc.revenue += product.calc.suggestedPrice;
        acc.profit += product.calc.profit;
        acc.cost += product.calc.adjustedCost;
        return acc;
      },
      { revenue: 0, profit: 0, cost: 0 }
    );
  }, [productCalculations]);

  const updateProduct = (id, field, value) => {
    const numericFields = ["materialCost", "wastePercent", "laborHours", "marginPercent", "marketPrice"];

    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        if (product.id !== id) return product;

        if (field === "type") {
          const selectedType = productTypes[value];

          return {
            ...product,
            type: value,
            marginPercent: selectedType ? selectedType.suggestedMargin : product.marginPercent,
            wastePercent: selectedType ? selectedType.suggestedWaste : product.wastePercent,
          };
        }

        return {
          ...product,
          [field]: numericFields.includes(field) ? numberValue(value) : value,
        };
      })
    );
  };

  const addProduct = () => {
    setProducts((current) => [
      ...current,
      {
        id: Date.now(),
        name: "Nuevo producto",
        type: "premium",
        materialCost: 0,
        wastePercent: 10,
        laborHours: 1,
        complexity: "B",
        marginPercent: productTypes.premium.suggestedMargin,
        marketPrice: 0,
      },
    ]);
  };

  const removeProduct = (id) => {
    setProducts((current) => current.filter((product) => product.id !== id));
  };

  const totalMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#f6efe3] text-[#23160f] p-4 md:p-8 selection:bg-[#b8753a] selection:text-[#23160f]">
      <div className="fixed inset-0 pointer-events-none opacity-[0.18] bg-[radial-gradient(circle_at_20%_10%,#d6a15f_0,transparent_30%),radial-gradient(circle_at_80%_20%,#8f4f24_0,transparent_35%),linear-gradient(135deg,#8f4f24_0.5px,transparent_0.5px)] bg-[length:100%_100%,100%_100%,22px_22px]" />

      <div className="relative max-w-7xl mx-auto space-y-6">
        <div className="rounded-[2rem] border border-[#d9c4a7] bg-[#fffaf1]/90 shadow-2xl shadow-[#6f4a2d]/10 overflow-hidden">
          <div className="p-6 md:p-8 bg-[linear-gradient(120deg,rgba(255,250,241,0.92),rgba(246,239,227,0.86)),radial-gradient(circle_at_90%_10%,rgba(214,161,95,0.25),transparent_35%)]">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c99355]/40 bg-[#f6efe3]/80 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#8f4f24]">
                  <TreePine className="w-3.5 h-3.5" /> NAOS Costa Rica
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mt-5 text-[#23160f]">
                  Costeo NAOS
                </h1>
                <p className="text-[#6f4a2d] mt-4 max-w-2xl text-base md:text-lg">
                  Control financiero para piezas artesanales, madera premium y proyectos personalizados.
                </p>
              </div>

              <button
                onClick={addProduct}
                className="inline-flex items-center justify-center rounded-2xl bg-[#8f4f24] px-5 py-3 text-sm font-semibold text-[#fff8eb] hover:bg-[#a8612e] transition shadow-lg shadow-[#6f4a2d]/10"
              >
                <Plus className="w-4 h-4 mr-2" /> Agregar producto
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ControlCard label="Gastos mensuales" value={monthlyExpenses} onChange={setMonthlyExpenses} />
          <ControlCard label="Horas productivas / mes" value={productiveHours} onChange={setProductiveHours} />
          <ControlCard label="Tipo de cambio" value={exchangeRate} onChange={setExchangeRate} />

          <div className="bg-[#8f4f24] text-[#fff8eb] rounded-3xl p-5 shadow-xl shadow-[#6f4a2d]/10 border border-[#f1c98c]/30">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calculator className="w-4 h-4" /> Hora taller real
            </div>
            <div className="text-3xl font-semibold mt-3">{crc.format(hourlyRate)}</div>
            <p className="text-sm mt-2 opacity-80">Costo base por hora productiva.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard title="Ventas sugeridas" value={crc.format(totals.revenue)} icon={<TrendingUp className="w-5 h-5" />} />
          <SummaryCard title="Utilidad estimada" value={crc.format(totals.profit)} icon={<CheckCircle2 className="w-5 h-5" />} />
          <SummaryCard title="Margen total" value={`${totalMargin.toFixed(1)}%`} icon={<Calculator className="w-5 h-5" />} />
        </div>

        <div className="space-y-4">
          {productCalculations.map((product) => {
            const minMargin = productTypes[product.type]?.minMargin || 0;
            const suggestedMargin = productTypes[product.type]?.suggestedMargin || 0;
            const suggestedWaste = productTypes[product.type]?.suggestedWaste || 0;
            const belowRecommended = product.marginPercent < minMargin;

            return (
              <div key={product.id} className="bg-[#fffaf1]/95 border border-[#d9c4a7] rounded-[2rem] overflow-hidden shadow-xl shadow-[#6f4a2d]/10">
                <div className="h-1.5 bg-gradient-to-r from-[#8f4f24] via-[#c99355] to-[#f1c98c]" />
                <div className="p-5 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-2">
                        <FieldLabel>Producto</FieldLabel>
                        <input
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                          className="input-naos mt-2"
                        />
                      </div>

                      <div>
                        <FieldLabel>Tipo</FieldLabel>
                        <select
                          value={product.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            updateProduct(product.id, "type", newType);
                          }}
                          className="input-naos mt-2"
                        >
                          {Object.entries(productTypes).map(([key, option]) => (
                            <option key={key} value={key}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <FieldLabel>Complejidad</FieldLabel>
                        <select
                          value={product.complexity}
                          onChange={(e) => updateProduct(product.id, "complexity", e.target.value)}
                          className="input-naos mt-2"
                        >
                          {Object.entries(complexityOptions).map(([key, option]) => (
                            <option key={key} value={key}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <NumberField label="Materiales" value={product.materialCost} onChange={(value) => updateProduct(product.id, "materialCost", value)} />
                      <NumberField label="Desperdicio %" value={product.wastePercent} onChange={(value) => updateProduct(product.id, "wastePercent", value)} />
                      <NumberField label="Horas mano de obra" value={product.laborHours} onChange={(value) => updateProduct(product.id, "laborHours", value)} />
                      <NumberField label="Margen deseado %" value={product.marginPercent} onChange={(value) => updateProduct(product.id, "marginPercent", value)} />
                      <NumberField label="Precio mercado / actual" value={product.marketPrice} onChange={(value) => updateProduct(product.id, "marketPrice", value)} />
                    </div>

                    <div className="w-full lg:w-80 bg-[#f6efe3] rounded-[1.7rem] p-5 border border-[#d9c4a7] space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[#6f4a2d] text-sm">Precio sugerido</p>
                          <p className="text-3xl font-semibold mt-1 text-[#23160f]">{crc.format(product.calc.suggestedPrice)}</p>
                          <p className="text-[#8f4f24] text-sm">{usd.format(product.calc.suggestedUsd)}</p>
                        </div>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="rounded-xl p-2 text-[#8f4f24] hover:text-red-300 hover:bg-red-950/30 transition"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <Metric label="Material + desperdicio" value={crc.format(product.calc.materialWithWaste)} />
                        <Metric label="Mano de obra" value={crc.format(product.calc.laborCost)} />
                        <Metric label="Costo ajustado" value={crc.format(product.calc.adjustedCost)} />
                        <Metric label="Utilidad" value={crc.format(product.calc.profit)} />
                        <Metric label="Margen bruto" value={`${product.calc.grossMargin.toFixed(1)}%`} />
                        <Metric label="Margen recomendado" value={`${suggestedMargin}%`} />
                        <Metric label="Desperdicio recomendado" value={`${suggestedWaste}%`} />
                        <Metric label="Dif. vs actual" value={product.marketPrice ? crc.format(product.calc.marketGap) : "—"} />
                      </div>

                      {belowRecommended ? (
                        <div className="flex gap-2 p-3 rounded-2xl bg-[#7c4b18]/30 text-[#f1c98c] text-sm border border-[#c99355]/20">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          Margen bajo para este tipo de producto. Revisar precio o complejidad.
                        </div>
                      ) : (
                        <div className="flex gap-2 p-3 rounded-2xl bg-[#31421f]/35 text-[#d7e7a0] text-sm border border-[#d7e7a0]/15">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          Margen dentro de rango recomendado.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          .input-naos {
            width: 100%;
            border-radius: 0.9rem;
            border: 1px solid #d9c4a7;
            background: rgba(255, 250, 241, 0.96);
            color: #23160f;
            padding: 0.6rem 0.75rem;
            outline: none;
            transition: border-color 160ms ease, box-shadow 160ms ease;
          }
          .input-naos:focus {
            border-color: #c99355;
            box-shadow: 0 0 0 3px rgba(201, 147, 85, 0.16);
          }
          .input-naos option {
            background: #fffaf1;
            color: #23160f;
          }
        `}</style>
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="text-sm font-medium text-[#6f4a2d]">{children}</label>;
}

function NumberField({ label, value, onChange }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-naos mt-2"
      />
    </div>
  );
}

function ControlCard({ label, value, onChange }) {
  return (
    <div className="bg-[#fffaf1]/95 border border-[#d9c4a7] rounded-3xl p-5 shadow-xl shadow-[#6f4a2d]/10">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(numberValue(e.target.value))}
        className="input-naos mt-2"
      />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-[#fffaf1] rounded-2xl p-3 border border-[#d9c4a7]">
      <p className="text-[#8f4f24] text-xs">{label}</p>
      <p className="text-[#23160f] font-medium mt-1">{value}</p>
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-[#fffaf1]/95 border border-[#d9c4a7] rounded-3xl p-5 flex items-center justify-between shadow-xl shadow-[#6f4a2d]/10">
      <div>
        <p className="text-[#6f4a2d] text-sm">{title}</p>
        <p className="text-2xl font-semibold mt-1 text-[#23160f]">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-2xl bg-[#f6efe3] border border-[#d9c4a7] flex items-center justify-center text-[#c99355]">
        {icon}
      </div>
    </div>
  );
}
