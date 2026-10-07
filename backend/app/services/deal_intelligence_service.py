class DealIntelligenceService:
    UNDERPRICED_THRESHOLD = -10.0
    OVERPRICED_THRESHOLD = 10.0

    @classmethod
    def analyze_deal(cls, estimated_market_value_lakh: float, asking_price_lakh: float) -> dict:
        if estimated_market_value_lakh <= 0 or asking_price_lakh <= 0:
            raise ValueError("Values must be positive")

        price_difference_lakh = asking_price_lakh - estimated_market_value_lakh
        price_difference_percent = (price_difference_lakh / estimated_market_value_lakh) * 100

        # Determine Status
        if price_difference_percent <= cls.UNDERPRICED_THRESHOLD:
            deal_status = "Underpriced"
        elif price_difference_percent >= cls.OVERPRICED_THRESHOLD:
            deal_status = "Overpriced"
        else:
            deal_status = "Fairly Priced"

        # Determine Deal Score (0-100)
        absolute_difference = abs(price_difference_percent)
        deal_score = max(0, int(100 - (absolute_difference * 2)))

        # Indicative Negotiation Range (+/- 5%)
        negotiation_range_low_lakh = estimated_market_value_lakh * 0.95
        negotiation_range_high_lakh = estimated_market_value_lakh * 1.05

        # Explanation
        diff_abs = abs(price_difference_percent)
        if diff_abs < 1.0:
            explanation = "Listing is priced exactly at the model estimate."
        else:
            direction = "above" if price_difference_percent > 0 else "below"
            explanation = f"Listing is approximately {diff_abs:.0f}% {direction} the model estimate."

        return {
            "asking_price_lakh": round(asking_price_lakh, 2),
            "price_difference_lakh": round(price_difference_lakh, 2),
            "price_difference_percent": round(price_difference_percent, 2),
            "deal_score": deal_score,
            "deal_status": deal_status,
            "negotiation_range_low_lakh": round(negotiation_range_low_lakh, 2),
            "negotiation_range_high_lakh": round(negotiation_range_high_lakh, 2),
            "explanation": explanation
        }
