import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

// Supported currencies
export const CURRENCIES = {
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
  },
};

export function CurrencyProvider({ children }) {
  // Get stored currency from localStorage or default to GBP
  const [currency, setCurrency] = useState(() => {
    const stored = localStorage.getItem("selectedCurrency");
    return stored && CURRENCIES[stored] ? stored : "GBP";
  });

  const [exchangeRate, setExchangeRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (currency === "GBP") {
        setExchangeRate(1);
        return;
      }

      try {
        setIsLoading(true);

        // Use exchangerate-api.com (free, no auth required, browser-friendly)
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/GBP`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch exchange rate");
        }

        const data = await response.json();
        const rate = data.rates[currency];

        if (rate) {
          setExchangeRate(rate);
          console.log(`Exchange rate updated: 1 GBP = ${rate} ${currency}`);
        } else {
          throw new Error(`Currency ${currency} not found`);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        // Fallback to approximate rate if API fails
        const fallbackRates = {
          EUR: 1.17,
          USD: 1.27,
        };
        setExchangeRate(fallbackRates[currency] || 1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRate();
    // Store selected currency
    localStorage.setItem("selectedCurrency", currency);
  }, [currency]);

  // Convert price from GBP to selected currency
  const convertPrice = (gbpPrice) => {
    if (!gbpPrice || isNaN(gbpPrice)) return 0;
    return gbpPrice * exchangeRate;
  };

  // Format price with currency symbol
  const formatPrice = (gbpPrice, options = {}) => {
    const {
      showDecimals = true,
      showSymbol = true,
      showCode = false,
    } = options;

    const converted = convertPrice(gbpPrice);
    const currencyInfo = CURRENCIES[currency];

    let formatted = showDecimals
      ? converted.toFixed(2)
      : Math.round(converted).toString();

    if (showSymbol) {
      formatted = `${currencyInfo.symbol}${formatted}`;
    }

    if (showCode) {
      formatted = `${formatted} ${currencyInfo.code}`;
    }

    return formatted;
  };

  // Convert price back to GBP (for backend)
  const convertToGBP = (localPrice) => {
    if (!localPrice || isNaN(localPrice)) return 0;
    if (currency === "GBP") return localPrice;
    return localPrice / exchangeRate;
  };

  const value = {
    currency,
    setCurrency,
    currencyInfo: CURRENCIES[currency],
    exchangeRate,
    isLoading,
    convertPrice,
    formatPrice,
    convertToGBP,
    allCurrencies: CURRENCIES,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Custom hook to use currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
