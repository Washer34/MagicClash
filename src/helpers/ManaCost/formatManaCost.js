export function formatManaCost(manaCost) {
  const formattedManaCostWithNumbers = manaCost.replace(/{(\d+)}/g, (match, number) => {
    return `<span class="mana">${number}</span>`;
  });

  // Remplacez les symboles de mana par des éléments <img> avec le bon chemin d'image
  const formattedManaCostWithSymbols = formattedManaCostWithNumbers.replace(/{([GBRUW])}/g, (match, symbol) => {
    // Utilisez une logique pour déterminer le chemin d'image en fonction du symbole
    const imagePath = `src/assets/${symbol}-mana.png`;
    return `<img src="${imagePath}" alt="${symbol}" />`;
  });

  return formattedManaCostWithSymbols;
}
