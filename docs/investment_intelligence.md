# Investment Intelligence Module

The Investment Intelligence module provides scenario-based modeling for rental yields, property appreciation, and total returns. It calculates investment viability based entirely on user-supplied assumptions and explicit formulas rather than speculative or "black box" future projections.

## Input Assumptions

The module accepts the following inputs via `POST /api/investment-analysis`:

- **Property Value (`property_value_lakh`)**: Required. The current estimated or asking value of the property in Lakhs.
- **Monthly Rent (`monthly_rent`)**: Optional. Converted automatically to `annual_rent = monthly_rent * 12`.
- **Annual Rent (`annual_rent`)**: Optional. Used directly for yield calculation if provided.
- **Holding Period (`holding_period_years`)**: Required. The expected number of years the asset will be held before exit.
- **Expected Annual Appreciation (`expected_annual_appreciation_percent`)**: Optional. The baseline annual compounding growth rate.
- **Annual Expenses (`annual_expense_percent`)**: Optional. Operating expenses (maintenance, taxes, etc.) as a percentage of gross annual rent.
- **Transaction Costs (`transaction_cost_percent`)**: Optional. Entry/exit costs (e.g., stamp duty, registration) as a percentage of the property value.

## Calculation Methodology

### Rental Yield
- **Gross Rental Yield (%)** = `(Annual Rent in INR / (Property Value in Lakh * 100000)) * 100`
- **Net Rental Yield (%)** = `(Net Annual Rent in INR / (Property Value in Lakh * 100000)) * 100` 
  *(where Net Annual Rent = Annual Rent * (1 - annual_expense_percent / 100))*

### Future Value Scenarios
The future value (FV) uses standard compound interest: `FV = PV * (1 + r)^t`
Three scenarios are generated automatically based on the user's base assumption (`r`):
- **Conservative Scenario**: `r - 2%`
- **Base Scenario**: `r`
- **Optimistic Scenario**: `r + 2%`

### Total Return and ROI
- **Cumulative Rent** = `Net Annual Rent * holding_period_years`
- **Total Capital Generated** = `Base Future Value + Cumulative Rent`
- **Total Costs** = `Current Property Value + Transaction Costs`
- **Estimated Total Return** = `Total Capital Generated - Total Costs`
- **Estimated ROI (%)** = `(Estimated Total Return / Total Costs) * 100`

### Investment Score
The system computes an objective score (out of 100) using a rule-based methodology based on the available inputs:
- **Rental Yield**: `> 4%` (+40 points), `> 2%` (+20 points)
- **Appreciation**: `> 7%` (+40 points), `> 4%` (+20 points)
- **Transaction Costs**: If any are supplied, it penalizes the score (-10 points) reflecting reduced liquidity/ROI.

Categories are assigned as:
- **Relatively Attractive**: >= 70 points
- **Moderate**: 40 - 69 points
- **Low**: < 40 points

## Limitations and Disclaimer
**This module provides scenario-based analytical estimates and is not financial advice or a guarantee of investment returns.** 
- It does not automatically factor in income tax, capital gains tax, inflation, or the time value of money (discounting) unless explicitly engineered into the raw percentage inputs by the user. 
- It never assumes or fabricates missing information—if rental inputs are missing, the yield and ROI cannot be calculated and are safely omitted.
