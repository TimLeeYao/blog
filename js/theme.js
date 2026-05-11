(function() {
  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'theme-toggle';
  toggleBtn.innerHTML = '🌙';
  document.body.appendChild(toggleBtn);

  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
    toggleBtn.innerHTML = '☀️';
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toggleBtn.innerHTML = isDark ? '☀️' : '🌙';
  });
})();