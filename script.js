/**
 * Выводит результаты расчётов на страницу.
 *
 * @param {object} results - Объект с результатами расчётов.
 */
function displayResults(results) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = ""; // Очищаем контейнер перед выводом новых результатов

  // Создаем заголовок таблицы
  const tableHeader = document.createElement("h3");
  tableHeader.textContent = "Результаты расчетов";
  resultsContainer.appendChild(tableHeader);

  // Создаем таблицу
  const table = document.createElement("table");
  resultsContainer.appendChild(table);

  // Создаем строку заголовков таблицы
  const headerRow = table.insertRow();
  const headerTitles = [
    "Показатель",
    "Исходные данные",
    "CTR +1%",
    "CTR +2%",
    "CTR +3%",
  ];
  headerTitles.forEach((title) => {
    const headerCell = headerRow.insertCell();
    headerCell.textContent = title;
    headerCell.style.fontWeight = "bold"; // Делаем заголовки жирными

    // Добавляем стили для центрирования текста в заголовках
    headerCell.style.textAlign = "center";
  });

  // Добавляем строку для затрат на тесты в результаты
  const testCosts = results["Исходные данные"]["Затраты на тесты"];
  const designCosts = results["Исходные данные"]["Затраты на дизайн"];
  const trafficCosts = results["Исходные данные"]["Затраты на трафик"];

  const metrics = Object.keys(results["Исходные данные"]).filter(
    (key) =>
      key !== "Затраты на тесты" &&
      key !== "Затраты на дизайн" &&
      key !== "Затраты на трафик"
  );
    metrics.splice(7, 0, "Затраты на тесты");
  metrics.splice(8, 0, "Затраты на дизайн");
  metrics.splice(9, 0, "Затраты на трафик");


  metrics.forEach((metric) => {
      const row = table.insertRow();
      const metricCell = row.insertCell();
      metricCell.textContent = metric;

      // Добавляем данные для каждого CTR, начиная с "Исходные данные"
      headerTitles.slice(1).forEach((ctrKey) => {
          const valueCell = row.insertCell();
          let value;

          const ctrDeltaString = ctrKey.replace("CTR +", "").replace("%", "").trim();
          const ctrDelta = parseFloat(ctrDeltaString.replace(',', '.'));


        if (ctrKey === "Исходные данные") {
            value = results[ctrKey][metric];
          } else {
            const currentResultKey = `CTR +${ctrDelta.toFixed(1)}%`;
            value = results[currentResultKey][metric];
          }


        if(ctrKey === "Исходные данные") {
            if (
                metric === "Изменение прибыли в день, руб." ||
                metric === "Изменение прибыли в неделю, руб." ||
                metric === "Изменение прибыли в месяц, руб." ||
                metric === "Изменение прибыли за 3 месяца, руб." ||
                metric === "Срок окупаемости затрат, дней" ||
                metric === "ROI за неделю, %" ||
                metric === "ROI за месяц, %" ||
                metric === "ROI за 3 месяца, %"
            ){
                value = "Не рассчитывается";
            } else if (typeof value === "number") {
            value = value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
            }

        } else {
             if (typeof value === "number") {
               value = value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
             }
        }

        valueCell.textContent = value;

        // Добавляем стили для центрирования текста в ячейках данных
        valueCell.style.textAlign = "center";
      });
    });




  // Добавляем выводы после таблицы
  const conclusionContainer = document.getElementById("conclusion");
  conclusionContainer.innerHTML = ""; // Очищаем контейнер перед выводом новых выводов

  const conclusionHeader = document.createElement("h3");
  conclusionHeader.textContent = "Выводы";
  conclusionContainer.appendChild(conclusionHeader);

  const conclusionText = document.createElement("p");
  conclusionText.innerHTML = `Результаты расчётов показывают, что A/B-тестирование может привести к увеличению вашей прибыли. Рассмотрим потенциальный эффект от увеличения CTR:<br>`;
  conclusionContainer.appendChild(conclusionText);

  headerTitles.slice(1).forEach((ctrKey) => {
      const ctrDeltaString = ctrKey.replace("CTR +", "").replace("%", "").trim();
      const ctrDelta = parseFloat(ctrDeltaString.replace(',', '.'));

    // Проверяем, что это не "Исходные данные"
    if (ctrKey !== "Исходные данные") {
        const currentResultKey = `CTR +${ctrDelta.toFixed(1)}%`; // Исправлено здесь
      const paybackPeriod = results[currentResultKey]["Срок окупаемости затрат, дней"];
      const profitIncrease3Months = results[currentResultKey][
        "Изменение прибыли за 3 месяца, руб."
      ];

      // Добавляем проверку деления на ноль
      const profitIncrease3MonthsPercent =
        results["Исходные данные"]["Чистая прибыль за 3 месяца, руб."] !== 0
          ? (profitIncrease3Months /
              results["Исходные данные"]["Чистая прибыль за 3 месяца, руб."]) *
            100
          : 0;

      const conclusionCtrText = document.createElement("p");
      conclusionCtrText.innerHTML += `<b>При увеличении CTR на ${ctrDelta.toFixed(1)}%:</b> `;

      if (paybackPeriod === "Не окупится") {
        conclusionCtrText.innerHTML += `При заданных параметрах A/B-тестирование не окупается. Затраты на дизайн: ${designCosts.toLocaleString(
          "ru-RU"
        )} руб., затраты на трафик: ${trafficCosts.toLocaleString(
          "ru-RU"
        )} руб. `;
        // Проверяем, что изменение прибыли не равно нулю
        if (profitIncrease3Months !== 0) {
          conclusionCtrText.innerHTML += `Ваша чистая прибыль за 3 месяца может измениться на ${profitIncrease3MonthsPercent.toFixed(2)}% (${results[currentResultKey]["Изменение прибыли за 3 месяца, руб."].toLocaleString("ru-RU")} руб.). `;
        }
        conclusionCtrText.innerHTML +=
          "Рекомендуется скорректировать исходные данные (например, снизить затраты на тесты, оптимизировать рекламный бюджет) или пересмотреть подход к A/B-тестированию.";
      } else if (paybackPeriod === "Не рассчитывается") {
        conclusionCtrText.innerHTML += `Для исходных данных не рассчитывается срок окупаемости и ROI, т.к. не с чем сравнивать. Рекомендуется провести тесты и получить данные о CTR, на основе которых можно точнее оценить окупаемость.`;
      } else {
        conclusionCtrText.innerHTML += `A/B-тестирование при заданных параметрах окупается за ${paybackPeriod.toFixed(
          1
        )} ${getDaysEnding(
          paybackPeriod
        )} и потенциально принесёт ${results[
          currentResultKey
        ]["Изменение прибыли за 3 месяца, руб."].toLocaleString(
          "ru-RU"
        )} руб. дополнительной прибыли за 3 месяца. Затраты на дизайн: ${designCosts.toLocaleString(
          "ru-RU"
        )} руб., затраты на трафик: ${trafficCosts.toLocaleString(
          "ru-RU"
        )} руб.`;
      }

      conclusionContainer.appendChild(conclusionCtrText);
    }
  });

  // Добавляем примечание
  const noteText = document.createElement("p");
  noteText.innerHTML =
    "Обратите внимание, что расчёты являются приблизительными и могут отличаться от фактических результатов.";
  conclusionContainer.appendChild(noteText);

  // Добавляем блок "Что дальше?"
  const whatNextContainer = document.createElement("div");
  whatNextContainer.setAttribute("id", "what-next");
  conclusionContainer.appendChild(whatNextContainer);

  const whatNextHeader = document.createElement("h3");
  whatNextHeader.textContent = "Что дальше?";
  whatNextContainer.appendChild(whatNextHeader);

  const whatNextText = document.createElement("p");
  whatNextText.innerHTML = `Вы увидели, как A/B-тестирование может увеличить вашу прибыль на Wildberries. Но это только вершина айсберга! A/B-тесты – это не разовая акция, а постоянный процесс улучшения ваших карточек товаров. Рынок не стоит на месте, конкуренты не дремлют. Регулярное A/B-тестирование – это ваш ключ к тому, чтобы всегда быть на шаг впереди.`;
  whatNextContainer.appendChild(whatNextText);

    // Добавляем блок "Узнать программу мастер-класса"
  const masterClassContainer = document.createElement("div");
  masterClassContainer.setAttribute("id", "master-class");
  conclusionContainer.appendChild(masterClassContainer);

  const masterClassHeader = document.createElement("h3");
  masterClassHeader.textContent = "Хотите освоить A/B-тестирование?";
  masterClassContainer.appendChild(masterClassHeader);

  const masterClassText = document.createElement("p");
  masterClassText.innerHTML = `Присоединяйтесь к чату предзаписи, чтобы узнать программу мастер-класса по A/B-тестированию карточек товаров на Wildberries, где вы сможете познать науку A/B-тестирования!`;
  masterClassContainer.appendChild(masterClassText);

  const masterClassButton = document.createElement("a");
  masterClassButton.setAttribute("href", "https://t.me/+czhYbv8i_ZMxNjRi"); // Замените на вашу ссылку
  masterClassButton.setAttribute("target", "_blank"); // Открывать ссылку в новой вкладке
  masterClassButton.classList.add("master-class-button");
  masterClassButton.textContent = "Узнать программу мастер-класса";
  masterClassContainer.appendChild(masterClassButton);
}
