import { createContext, useState } from "react";

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {

  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (athlete) => {

    if (favorites.find((a) => a.id === athlete.id)) {

      setFavorites(
        favorites.filter((a) => a.id !== athlete.id)
      );

    } else {

      setFavorites([...favorites, athlete]);

    }

  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}