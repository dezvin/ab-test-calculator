/**
 * Калькулятор окупаемости A/B-тестирования для Wildberries.
 */

/**
 * Получает значение из поля ввода по его id.
 *
 * @param {string} id - Идентификатор поля ввода.
 * @returns {number} - Значение поля ввода (число).
 * @throws {Error} - Если значение в поле не является числом или отрицательное.
 */
function getInputValue(id) {
  const value = parseFloat(document.getElementById(id).value);
  if (isNaN(value) || value < 0) {
    throw new Error(`Некорректное значение в поле ${id}`);
  }
  return value;
}

/**
 * Рассчитывает количество показов в день.
 *
 * @param {number} dailyBudget - Дневной бюджет на рекламу.
 * @param {number} cpm - CPM (стоимость 1000 показов).
 * @returns {number} - Количество показов в день.
 */
function calculateImpressions(dailyBudget, cpm) {
  return (dailyBudget / cpm) * 1000;
}

/**
 * Рассчитывает количество кликов в день.
 *
 * @param {number} impressions - Количество показов в день.
 * @param {number} ctr - CTR (кликабельность).
 * @returns {number} - Количество кликов в день.
 */
function calculateClicks(impressions, ctr) {
  return impressions * (ctr / 100);
}

/**
 * Рассчитывает количество добавлений в корзину в день.
 *
 * @param {number} clicks - Количество кликов в день.
 * @param {number} cartConversion - Конверсия в корзину.
 * @returns {number} - Количество добавлений в корзину в день.
 */
function calculateAddToCart(clicks, cartConversion) {
  return clicks * (cartConversion / 100);
}

/**
 * Рассчитывает количество заказов в день.
 *
 * @param {number} addToCart - Количество добавлений в корзину в день.
 * @param {number} orderConversion - Конверсия в заказ.
 * @returns {number} - Количество заказов в день.
 */
function calculateOrders(addToCart, orderConversion) {
  return addToCart * (orderConversion / 100);
}

/**
 * Рассчитывает количество выкупов в день.
 *
 * @param {number} orders - Количество заказов в день.
 * @param {number} redemptionRate - Процент выкупа.
 * @returns {number} - Количество выкупов в день.
 */
function calculateRedemptions(orders, redemptionRate) {
  return orders * (redemptionRate / 100);
}

/**
 * Рассчитывает выручку в день.
 *
 * @param {number} redemptions - Количество выкупов в день.
 * @param {number} productPrice - Средняя стоимость товара.
 * @returns {number} - Выручка в день.
 */
function calculateRevenue(redemptions, productPrice) {
  return redemptions * productPrice;
}

/**
 * Рассчитывает чистую прибыль в день.
 *
 * @param {number} redemptions - Количество выкупов в день.
 * @param {number} margin - Маржа с единицы товара.
 * @param {number} adCost - Расходы на рекламу в день.
 * @returns {number} - Чистая прибыль в день.
 */
function calculateNetProfit(redemptions, margin, adCost) {
  return redemptions * margin - adCost;
}

/**
 * Рассчитывает результаты для заданного CTR.
 *
 * @param {object} data - Объект с исходными данными.
 * @param {number} ctr - Значение CTR.
 * @param {number} impressions - Количество показов.
 * @param {number} testCosts - Общие затраты на тесты.
 * @param {boolean} isInitial - Флаг, указывающий, является ли расчет исходным.
 * @returns {object} - Объект с результатами расчётов для заданного CTR.
 */
function calculateResultForCTR(
  data,
  ctr,
  impressions,
  testCosts,
  isInitial = false
) {
  const clicks = calculateClicks(impressions, ctr);
  const addToCart = calculateAddToCart(clicks, data.cartConversion);
  const orders = calculateOrders(addToCart, data.orderConversion);
  const redemptions = calculateRedemptions(orders, data.redemptionRate);
  const revenue = calculateRevenue(redemptions, data.productPrice);
  const adCost = data.dailyBudget;
  const profit = calculateNetProfit(redemptions, data.margin, adCost);
  const weeklyProfit = profit * 7;
  const monthlyProfit = profit * 30;
  const quarterlyProfit = profit * 90;

  let profitDiffDay = 0;
  let profitDiffWeek = 0;
  let profitDiffMonth = 0;
  let profitDiffQuarter = 0;
  let paybackPeriod = "Не рассчитывается";
  let roiWeek = 0;
  let roiMonth = 0;
  let roiQuarter = 0;

  // Расчет изменения прибыли только для случаев с увеличенным CTR
  if (!isInitial) {
    const initialImpressions = calculateImpressions(data.dailyBudget, data.cpm);
    const initialClicks = calculateClicks(
      initialImpressions,
      data.currentCtr
    );
    const initialAddToCart = calculateAddToCart(
      initialClicks,
      data.cartConversion
    );
    const initialOrders = calculateOrders(
      initialAddToCart,
      data.orderConversion
    );
    const initialRedemptions = calculateRedemptions(
      initialOrders,
      data.redemptionRate
    );
    const initialProfit = calculateNetProfit(
      initialRedemptions,
      data.margin,
      data.dailyBudget
    );

    profitDiffDay = profit - initialProfit;
    profitDiffWeek = profitDiffDay * 7;
    profitDiffMonth = profitDiffDay * 30;
    profitDiffQuarter = profitDiffDay * 90;

    paybackPeriod =
      profitDiffDay > 0 ? testCosts / profitDiffDay : "Не окупится";
    roiWeek =
      profitDiffWeek > 0
        ? ((profitDiffWeek - testCosts) / testCosts) * 100
        : 0;
    roiMonth =
      profitDiffMonth > 0
        ? ((profitDiffMonth - testCosts) / testCosts) * 100
        : 0;
    roiQuarter =
      profitDiffQuarter > 0
        ? ((profitDiffQuarter - testCosts) / testCosts) * 100
        : 0;
  }


  return {
    "Показов в день": impressions,
    "Кликов в день": clicks,
    "Добавлений в корзину в день": addToCart,
    "Заказов в день": orders,
    "Выкупов в день": redemptions,
    "Выручка в день, руб.": revenue,
    "Расходы на рекламу в день, руб.": adCost,
    "Чистая прибыль в день, руб.": profit,
    "Чистая прибыль в неделю, руб.": weeklyProfit,
    "Чистая прибыль в месяц, руб.": monthlyProfit,
    "Чистая прибыль за 3 месяца, руб.": quarterlyProfit,
    "Изменение прибыли в день, руб.": profitDiffDay,
    "Изменение прибыли в неделю, руб.": profitDiffWeek,
    "Изменение прибыли в месяц, руб.": profitDiffMonth,
    "Изменение прибыли за 3 месяца, руб.": profitDiffQuarter,
    "Срок окупаемости затрат, дней": paybackPeriod,
    "ROI за неделю, %": roiWeek,
    "ROI за месяц, %": roiMonth,
    "ROI за 3 месяца, %": roiQuarter,
  };
}

/**
 * Выполняет расчёты для разных CTR и возвращает объект с результатами.
 *
 * @param {object} data - Объект с исходными данными.
 * @returns {object} - Объект с результатами расчётов.
 */
function calculateResults(data) {
  const impressions = calculateImpressions(data.dailyBudget, data.cpm);
  const totalDesignCost = data.designCostPerSlide * data.numDesignOptions;
  const testAdCost =
    data.numDesignOptions * data.impressionsPerTest * (data.cpm / 1000);
  const testCosts = totalDesignCost + testAdCost;
  const trafficCosts = testCosts - totalDesignCost;

  const ctrValues = [
    data.currentCtr,
    data.currentCtr + 1,
    data.currentCtr + 2,
    data.currentCtr + 3,
  ];

  const results = {};
  ctrValues.forEach((ctr, index) => {
    const resultKey =
      index === 0 ? "Исходные данные" : `CTR +${ctr - data.currentCtr}%`;
    results[resultKey] = calculateResultForCTR(
      data,
      ctr,
      impressions,
      testCosts,
      index === 0
    );
    // Добавляем затраты на дизайн и трафик в каждый результат
    results[resultKey]["Затраты на тесты"] = testCosts;
    results[resultKey]["Затраты на дизайн"] = totalDesignCost;
    results[resultKey]["Затраты на трафик"] = trafficCosts;
  });

  return results;
}

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
        let value = results[ctrKey][metric];
    
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
    const ctrValue = parseInt(ctrKey.replace(/[^0-9]/g, "")); // Получаем числовое значение CTR из заголовка

    // Проверяем, что это не "Исходные данные"
    if (ctrKey !== "Исходные данные") {
      const paybackPeriod = results[ctrKey]["Срок окупаемости затрат, дней"];
      const profitIncrease3Months = results[ctrKey][
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
      conclusionCtrText.innerHTML += `<b>При увеличении CTR на ${ctrValue}%:</b> `;

      if (paybackPeriod === "Не окупится") {
        conclusionCtrText.innerHTML += `При заданных параметрах A/B-тестирование не окупается. Затраты на дизайн: ${designCosts.toLocaleString(
          "ru-RU"
        )} руб., затраты на трафик: ${trafficCosts.toLocaleString(
          "ru-RU"
        )} руб. `;
        // Проверяем, что изменение прибыли не равно нулю
        if (profitIncrease3Months !== 0) {
          conclusionCtrText.innerHTML += `Ваша чистая прибыль за 3 месяца может измениться на ${profitIncrease3MonthsPercent.toFixed(2)}% (${results[ctrKey]["Изменение прибыли за 3 месяца, руб."].toLocaleString("ru-RU")} руб.). `;
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
          ctrKey
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

/**
 * Возвращает правильное окончание для слова "день" в зависимости от числа.
 *
 * @param {number} number - Число дней.
 * @returns {string} - Правильное окончание.
 */
function getDaysEnding(number) {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "дней";
  } else if (lastDigit === 1) {
    return "день";
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return "дня";
  } else {
    return "дней";
  }
}

/**
 * Обработчик события отправки формы.
 *
 * @param {Event} event - Объект события.
 */
function handleSubmit(event) {
  event.preventDefault();

  try {
    const data = {
      dailyBudget: getInputValue("daily-budget"),
      cpm: getInputValue("cpm"),
      currentCtr: getInputValue("current-ctr"),
      cartConversion: getInputValue("cart-conversion"),
      orderConversion: getInputValue("order-conversion"),
      redemptionRate: getInputValue("redemption-rate"),
      productPrice: getInputValue("product-price"),
      margin: getInputValue("margin"),
      designCostPerSlide: getInputValue("design-cost-per-slide"),
      numDesignOptions: getInputValue("num-design-options"),
      impressionsPerTest: getInputValue("impressions-per-test"),
    };

    const results = calculateResults(data);
    displayResults(results);
  } catch (error) {
    alert(error.message);
  }
}

// Добавляем обработчик события отправки формы
const form = document.getElementById("calculator-form");
form.addEventListener("submit", handleSubmit);
