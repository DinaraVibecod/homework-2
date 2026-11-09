const sourceJson = `{
  "event": {
    "title": "Ночь в музее",
    "date": "15 ноября, 18:30",
    "place": "Музей космонавтики, проспект Мира, 111",
    "description": "Вечерняя программа с выставкой и экскурсиями",
    "meeting": "Сбор: 18:30. Начало: 19:00."
  },
  "services": [
    { "id": "guide", "title": "  Экскурсия с гидом  ", "price": 500 },
    { "id": "audio", "title": "Аудиогид", "price": 350 },
    { "id": "catalog", "title": "Каталог выставки", "price": 250 }
  ]
}`;

function buildReport(services, guideChecked, audioChecked, catalogChecked) {
  // Отбираем ID выбранных услуг
  const selectedIds = [];
  if (guideChecked) selectedIds.push("guide");
  if (audioChecked) selectedIds.push("audio");
  if (catalogChecked) selectedIds.push("catalog");

  // Фильтруем исходный массив услуг
  const filteredServices = services.filter(service => selectedIds.includes(service.id));

  // Создаем новый массив с нужными полями через map и очищаем title от пробелов по краям
  const items = filteredServices.map(service => {
    const { title, price } = service; // Одноуровневая деструктуризация
    return {
      title: title.trim(),
      price: price
    };
  });

  // Считаем общую сумму цен через reduce
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return {
    count: items.length,
    total: total,
    items: items
  };
}

const dataErrorElement = document.querySelector('#data-error');
const serviceForm = document.querySelector('#service-form');

let data = null;

try {
  // Разбираем JSON
  data = JSON.parse(sourceJson);
  
  // Заполняем данные на странице
  document.querySelector('#event-title').textContent = data.event.title;
  document.querySelector('#event-date').textContent = data.event.date;
  document.querySelector('#event-place').textContent = data.event.place;
  document.querySelector('#event-description').textContent = data.event.description;
  
  // Показываем форму
  serviceForm.hidden = false;
} catch (error) {
  // Если JSON поврежден
  dataErrorElement.textContent = "Ошибка данных.";
  dataErrorElement.hidden = false;
}

if (data) {
  const showProgramBtn = document.querySelector('#show-program');
  const programDiv = document.querySelector('#program');
  
  // Обработчик для показа программы
  showProgramBtn.addEventListener('click', function() {
    programDiv.innerHTML = data.event.meeting;
    programDiv.hidden = false;
  });

  const choiceErrorElement = document.querySelector('#choice-error');
  const resultDiv = document.querySelector('#result');
  const reportJsonElement = document.querySelector('#report-json');

  // Обработчик отправки формы
  serviceForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    // Читаем значения чекбоксов
    const guideChecked = document.querySelector('#guide').checked;
    const audioChecked = document.querySelector('#audio').checked;
    const catalogChecked = document.querySelector('#catalog').checked;

    const report = buildReport(data.services, guideChecked, audioChecked, catalogChecked);

    if (report.count === 0) {
      // Пустой выбор
      choiceErrorElement.textContent = "Выберите хотя бы одну услугу.";
      choiceErrorElement.hidden = false;
      
      resultDiv.hidden = true;
      reportJsonElement.hidden = true;
    } else {
      // Услуги выбраны
      choiceErrorElement.hidden = true;
      
      // Формируем innerHTML
      let resultHtml = `Выбрано услуг: ${report.count}<br>Итого: ${report.total} руб.`;
      report.items.forEach(item => {
        resultHtml += `<br>${item.title}`;
      });
      
      resultDiv.innerHTML = resultHtml;
      resultDiv.hidden = false;
      
      // Преобразуем отчет в JSON-строку и проверяем парсером
      const jsonString = JSON.stringify(report);
      JSON.parse(jsonString); // Проверка согласно условию
      
      reportJsonElement.textContent = jsonString;
      reportJsonElement.hidden = false;
    }
  });
}