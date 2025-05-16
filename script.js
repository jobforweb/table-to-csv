// Функция для заполнения выпадающего списка таблицами
function populateTableSelect() {
  const tables = document.querySelectorAll('table');
  const select = document.getElementById('table-select');

  if (tables.length === 0) {
      alert('На странице нет таблиц.');
      return;
  }

  // Очищаем выпадающий список
  select.innerHTML = '';

  // Заполняем выпадающий список
  tables.forEach((table, index) => {
      const option = document.createElement('option');
      option.value = index; // Индекс таблицы
      option.textContent = `Таблица ${index + 1}`;
      select.appendChild(option);
  });
}

// Функция для преобразования таблицы в CSV
function exportTableToCSV(table, filename, separator) {
  // Получаем строки таблицы
  const rows = Array.from(table.querySelectorAll('tr'));

  // Обработка первой строки заголовка (с объединенными ячейками)
  const headerRow1 = rows[0];
  const headerCells1 = Array.from(headerRow1.querySelectorAll('th'));
  let headerValues1 = [];

  let colIndex = 0; // Индекс текущего столбца
  headerCells1.forEach(cell => {
      const colspan = parseInt(cell.getAttribute('colspan')) || 1; // Если colspan не указан, считаем его равным 1
      const cellValue = `"${cell.textContent.trim().replace(/"/g, '""')}"`; // Экранируем кавычки

      // Добавляем значение ячейки в массив нужное количество раз (дублируем для объединенных ячеек)
      for (let i = 0; i < colspan; i++) {
          headerValues1[colIndex++] = cellValue;
      }
  });

  // Обработка второй строки заголовка (без объединенных ячеек)
  const headerRow2 = rows[1];
  const headerCells2 = Array.from(headerRow2.querySelectorAll('th'));
  const headerValues2 = headerCells2.map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`);

  // Обработка остальных строк (данные)
  const dataRows = rows.slice(2).map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      return cells.map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`).join(separator);
  });

  // Собираем CSV: объединяем заголовки и данные
  const csvContent = [headerValues1.join(separator), headerValues2.join(separator), ...dataRows].join('\n');

  // Добавляем BOM (Byte Order Mark) для корректного распознавания UTF-8
  const bom = '\uFEFF';
  const finalCsvContent = bom + csvContent;

  // Создаем Blob (двоичный объект) для CSV
  const blob = new Blob([finalCsvContent], { type: 'text/csv;charset=utf-8;' });

  // Создаем ссылку для скачивания
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`); // Имя файла из поля ввода
  link.style.visibility = 'hidden';

  // Добавляем ссылку на страницу, эмулируем клик и удаляем ссылку
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Обработчик кнопки "Сформировать CSV"
document.getElementById('confirm-export-btn').addEventListener('click', () => {
  // Получаем выбранную таблицу
  const tableIndex = document.getElementById('table-select').value;
  const tables = document.querySelectorAll('table');
  const selectedTable = tables[tableIndex];

  if (!selectedTable) {
      alert('Таблица не выбрана.');
      return;
  }

  // Получаем имя файла
  const filename = document.getElementById('filename-input').value.trim();
  if (!filename) {
      alert('Введите имя файла.');
      return;
  }

  // Получаем выбранный разделитель
  const separator = document.getElementById('separator-select').value;

  // Выгружаем таблицу в CSV
  exportTableToCSV(selectedTable, filename, separator);

  // Закрываем модальное окно
  const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
  modal.hide();
});

// Инициализация выпадающего списка при загрузке страницы
document.addEventListener('DOMContentLoaded', populateTableSelect);