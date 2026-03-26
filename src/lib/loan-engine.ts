export interface EMIScheduleEntry {
  period: number
  dueDate: Date
  emi: number
  principal: number
  interest: number
  balance: number
}

export function generateEMISchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDate: Date,
  method: 'flat' | 'reducing' = 'reducing'
): EMIScheduleEntry[] {
  const schedule: EMIScheduleEntry[] = []
  let balance = principal
  
  if (method === 'reducing') {
    const monthlyRate = annualRate / 12 / 100
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    
    for (let i = 1; i <= tenureMonths; i++) {
      const interest = balance * monthlyRate
      const principalPaid = emi - interest
      balance -= principalPaid
      
      const dueDate = new Date(startDate)
      dueDate.setMonth(startDate.getMonth() + i)
      
      schedule.push({
        period: i,
        dueDate,
        emi: parseFloat(emi.toFixed(2)),
        principal: parseFloat(principalPaid.toFixed(2)),
        interest: parseFloat(interest.toFixed(2)),
        balance: parseFloat(Math.max(0, balance).toFixed(2))
      })
    }
  } else {
    // Flat rate
    const totalInterest = (principal * annualRate * (tenureMonths / 12)) / 100
    const totalAmount = principal + totalInterest
    const emi = totalAmount / tenureMonths
    const principalPerMonth = principal / tenureMonths
    const interestPerMonth = totalInterest / tenureMonths
    
    for (let i = 1; i <= tenureMonths; i++) {
      balance -= principalPerMonth
      
      const dueDate = new Date(startDate)
      dueDate.setMonth(startDate.getMonth() + i)
      
      schedule.push({
        period: i,
        dueDate,
        emi: parseFloat(emi.toFixed(2)),
        principal: parseFloat(principalPerMonth.toFixed(2)),
        interest: parseFloat(interestPerMonth.toFixed(2)),
        balance: parseFloat(Math.max(0, balance).toFixed(2))
      })
    }
  }
  
  return schedule
}

export function calculatePenalty(emiAmount: number, penaltyRate: number = 1): number {
  return (emiAmount * penaltyRate) / 100
}
