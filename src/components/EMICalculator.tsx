import React, { useState } from 'react';
import { IndianRupee, Percent, Calendar, Calculator } from 'lucide-react';

interface EMICalculatorProps {
  propertyPrice: number;
}

export const EMICalculator: React.FC<EMICalculatorProps> = ({ propertyPrice }) => {
  // Initial mortgage configurations
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);

  const loanAmount = Math.round(propertyPrice * (1 - downPaymentPercent / 100));
  const downPaymentAmount = propertyPrice - loanAmount;

  // EMI math formula
  const monthlyRate = interestRate / (12 * 100);
  const numberOfMonths = tenureYears * 12;
  
  let monthlyEMI = 0;
  if (monthlyRate > 0) {
    monthlyEMI = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
      (Math.pow(1 + monthlyRate, numberOfMonths) - 1)
    );
  } else {
    monthlyEMI = Math.round(loanAmount / numberOfMonths);
  }

  const totalPayment = monthlyEMI * numberOfMonths;
  const totalInterest = totalPayment - loanAmount;
  const principalPercentage = Math.round((loanAmount / totalPayment) * 100) || 0;
  const interestPercentage = 100 - principalPercentage;

  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    } else {
      return `₹${val.toLocaleString('en-IN')}`;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-neutral-900 text-base">Interactive EMI Mortgage Calculator</h3>
          <p className="text-[11px] text-neutral-500">Analyze loan structures, interest rates, and downpayments instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Inputs Section */}
        <div className="space-y-6">
          {/* Downpayment Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-700">
              <span>Down Payment ({downPaymentPercent}%)</span>
              <span className="font-mono text-emerald-600">{formatCurrency(downPaymentAmount)}</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>Min: 10% ({formatCurrency(propertyPrice * 0.1)})</span>
              <span>Max: 90% ({formatCurrency(propertyPrice * 0.9)})</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-700">
              <span>Interest Rate (p.a.)</span>
              <span className="font-mono text-emerald-600 flex items-center gap-0.5">
                {interestRate}% <Percent className="w-3.5 h-3.5 text-neutral-400" />
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="15"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>Min: 6.0%</span>
              <span>Max: 15.0%</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-700">
              <span>Loan Tenure</span>
              <span className="font-mono text-emerald-600 flex items-center gap-0.5">
                {tenureYears} Years <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setInterestRate(tenureYears => {
                setTenureYears(Number(e.target.value));
                return interestRate;
              })}
              className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>Min: 5 Years</span>
              <span>Max: 30 Years</span>
            </div>
          </div>
        </div>

        {/* Right Output Analysis Section */}
        <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5 bg-white border border-neutral-100 p-3.5 rounded-xl">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">Monthly EMI</span>
              <p className="text-lg font-bold text-neutral-900 font-display">{formatCurrency(monthlyEMI)}</p>
            </div>
            <div className="space-y-0.5 bg-white border border-neutral-100 p-3.5 rounded-xl">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">Principal Loan</span>
              <p className="text-lg font-bold text-slate-800 font-display">{formatCurrency(loanAmount)}</p>
            </div>
            <div className="space-y-0.5 bg-white border border-neutral-100 p-3.5 rounded-xl col-span-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">Total Interest Payable</span>
              <p className="text-base font-bold text-emerald-700 font-display">{formatCurrency(totalInterest)}</p>
            </div>
          </div>

          {/* Visual Percentage Split Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-neutral-500 font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                Principal: {principalPercentage}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Interest: {interestPercentage}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-200 border border-neutral-300">
              <div 
                className="bg-slate-700 transition-all duration-300" 
                style={{ width: `${principalPercentage}%` }}
              />
              <div 
                className="bg-emerald-500 transition-all duration-300" 
                style={{ width: `${interestPercentage}%` }}
              />
            </div>
          </div>

          {/* Value Advice */}
          <div className="text-[10px] text-neutral-500 leading-relaxed font-mono bg-white/70 border border-neutral-100 p-3 rounded-xl">
            💡 **Smart Tip:** Opting for a shorter loan term increases monthly payments but dramatically decreases overall interest paid. Over 20 years at {interestRate}%, you pay {interestPercentage}% of total capital in interest.
          </div>
        </div>

      </div>

    </div>
  );
};
