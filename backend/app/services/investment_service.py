from typing import List
from app.schemas.investment import InvestmentAnalysisRequest, InvestmentAnalysisResponse, InvestmentScoreFactor

class InvestmentService:

    @staticmethod
    def analyze_investment(req: InvestmentAnalysisRequest) -> InvestmentAnalysisResponse:
        warnings = []
        assumptions = {}
        
        prop_val_lakh = req.property_value_lakh
        
        # 1. Rental Calculation
        annual_rent_inr = None
        if req.annual_rent is not None:
            annual_rent_inr = req.annual_rent
            assumptions["Annual Rent Provided"] = True
            if req.monthly_rent is not None:
                # Validate consistency if both provided
                if abs(req.monthly_rent * 12 - req.annual_rent) > 100:
                    warnings.append("Monthly rent and annual rent provided do not perfectly match. Using annual rent.")
        elif req.monthly_rent is not None:
            annual_rent_inr = req.monthly_rent * 12
            assumptions["Calculated Annual Rent from Monthly"] = True
            
        annual_rent_lakh = annual_rent_inr / 100000.0 if annual_rent_inr is not None else None
        
        gross_rental_yield = None
        net_rental_yield = None
        if annual_rent_lakh is not None and prop_val_lakh > 0:
            gross_rental_yield = (annual_rent_lakh / prop_val_lakh) * 100.0
            
            if req.annual_expense_percent is not None:
                net_rent_lakh = annual_rent_lakh * (1 - req.annual_expense_percent / 100.0)
                net_rental_yield = (net_rent_lakh / prop_val_lakh) * 100.0
                assumptions["Annual Expenses"] = f"{req.annual_expense_percent}% of rent"
            else:
                warnings.append("No annual expenses provided. Gross rental yield shown only.")
        else:
            warnings.append("Rental information is unavailable. Cannot calculate rental yield.")

        # 2. Transaction Costs
        transaction_cost_lakh = None
        if req.transaction_cost_percent is not None:
            transaction_cost_lakh = prop_val_lakh * (req.transaction_cost_percent / 100.0)
            assumptions["Transaction Costs"] = f"{req.transaction_cost_percent}% of property value"

        # 3. Future Value Scenarios
        fv_conservative = None
        fv_base = None
        fv_optimistic = None
        
        base_appreciation = req.expected_annual_appreciation_percent
        if base_appreciation is not None:
            years = req.holding_period_years
            fv_base = prop_val_lakh * ((1 + base_appreciation / 100.0) ** years)
            fv_conservative = prop_val_lakh * ((1 + (base_appreciation - 2.0) / 100.0) ** years)
            fv_optimistic = prop_val_lakh * ((1 + (base_appreciation + 2.0) / 100.0) ** years)
            assumptions["Base Appreciation"] = f"{base_appreciation}% per year"
        else:
            warnings.append("No expected annual appreciation provided. Cannot calculate future value scenarios.")

        # 4. Total Return & ROI
        cumulative_rent_lakh = None
        if annual_rent_lakh is not None:
            net_annual = annual_rent_lakh * (1 - (req.annual_expense_percent or 0) / 100.0)
            cumulative_rent_lakh = net_annual * req.holding_period_years

        total_return_lakh = None
        roi_percent = None
        
        if fv_base is not None:
            total_value_generated = fv_base
            if cumulative_rent_lakh is not None:
                total_value_generated += cumulative_rent_lakh
                
            total_cost = prop_val_lakh
            if transaction_cost_lakh is not None:
                total_cost += transaction_cost_lakh
                
            total_return_lakh = total_value_generated - total_cost
            roi_percent = (total_return_lakh / total_cost) * 100.0

        # 5. Investment Score
        factors: List[InvestmentScoreFactor] = []
        score = 0
        
        if gross_rental_yield is not None:
            if gross_rental_yield >= 4.0:
                score += 40
                factors.append(InvestmentScoreFactor(factor="Rental Yield", impact="Positive", explanation=f"Yield of {gross_rental_yield:.1f}% is relatively strong."))
            elif gross_rental_yield >= 2.0:
                score += 20
                factors.append(InvestmentScoreFactor(factor="Rental Yield", impact="Neutral", explanation=f"Yield of {gross_rental_yield:.1f}% is moderate."))
            else:
                factors.append(InvestmentScoreFactor(factor="Rental Yield", impact="Negative", explanation=f"Yield of {gross_rental_yield:.1f}% is low."))
                
        if base_appreciation is not None:
            if base_appreciation >= 7.0:
                score += 40
                factors.append(InvestmentScoreFactor(factor="Appreciation Assumption", impact="Positive", explanation=f"Assumption of {base_appreciation}% is optimistic."))
            elif base_appreciation >= 4.0:
                score += 20
                factors.append(InvestmentScoreFactor(factor="Appreciation Assumption", impact="Neutral", explanation=f"Assumption of {base_appreciation}% is moderate."))
            else:
                factors.append(InvestmentScoreFactor(factor="Appreciation Assumption", impact="Negative", explanation=f"Assumption of {base_appreciation}% is conservative."))
                
        if transaction_cost_lakh is not None:
            score -= 10
            factors.append(InvestmentScoreFactor(factor="Transaction Costs", impact="Negative", explanation="Transaction costs reduce total ROI."))

        investment_score = None
        investment_category = None
        
        if gross_rental_yield is not None and base_appreciation is not None:
            investment_score = max(0, min(100, score))
            if investment_score >= 70:
                investment_category = "Relatively Attractive"
            elif investment_score >= 40:
                investment_category = "Moderate"
            else:
                investment_category = "Low"
        else:
            warnings.append("Insufficient inputs to calculate a defensible Investment Score.")

        return InvestmentAnalysisResponse(
            current_property_value_lakh=round(prop_val_lakh, 2),
            annual_rent_lakh=round(annual_rent_lakh, 2) if annual_rent_lakh is not None else None,
            gross_rental_yield_percent=round(gross_rental_yield, 2) if gross_rental_yield is not None else None,
            net_rental_yield_percent=round(net_rental_yield, 2) if net_rental_yield is not None else None,
            future_value_conservative_lakh=round(fv_conservative, 2) if fv_conservative is not None else None,
            future_value_base_lakh=round(fv_base, 2) if fv_base is not None else None,
            future_value_optimistic_lakh=round(fv_optimistic, 2) if fv_optimistic is not None else None,
            cumulative_rent_lakh=round(cumulative_rent_lakh, 2) if cumulative_rent_lakh is not None else None,
            transaction_cost_lakh=round(transaction_cost_lakh, 2) if transaction_cost_lakh is not None else None,
            estimated_total_return_lakh=round(total_return_lakh, 2) if total_return_lakh is not None else None,
            estimated_roi_percent=round(roi_percent, 2) if roi_percent is not None else None,
            investment_score=investment_score,
            investment_category=investment_category,
            factors=factors,
            assumptions=assumptions,
            warnings=warnings
        )
