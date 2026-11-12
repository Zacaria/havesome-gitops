(() => {
  const actual = document.getElementById('actual');
  const status = document.getElementById('status');
  const render = (value, message) => {
    actual.textContent = String(value);
    status.textContent = message;
  };
  document.getElementById('drift').addEventListener('click', () => render(2, 'Dérive · 2 observés, 3 souhaités.'));
  document
    .getElementById('reconcile')
    .addEventListener('click', () => render(3, 'Réconcilié · le modèle rejoint l’intention.'));
  document
    .getElementById('reset')
    .addEventListener('click', () => render(3, 'Aligné · l’état observé correspond à l’intention.'));
})();
