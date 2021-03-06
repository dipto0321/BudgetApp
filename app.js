var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  var calculateTotal = function(type) {
    sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.total[type] = sum;
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      //   Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    // Delete items
    deleteItem: function(type, id) {
      var index, ids;
      ids = data.allItems[type].map(function(cur) {
        return cur.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    // Calculate the budget
    calculateBudget: function() {
      // Calculate Total
      calculateTotal("exp");
      calculateTotal("inc");
      // Calculate budget
      data.budget = data.total.inc - data.total.exp;
      // Calculate percentages
      if (data.total.inc > 0) {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    // Calculate the Percentage
    calculatePercentage: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.total.inc);
      });
    },

    // Get Percentage
    getPercentage: function() {
      var allPercentage = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPercentage;
    },

    // Get budget
    getBudget: function() {
      return {
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        budget: data.budget,
        percentage: data.percentage
      };
    },
    testData: function() {
      console.log(data);
    }
  };
})();

var UIController = (function() {
  var DOMStrings = {
    inputType: ".add__type",
    inputDesciption: ".add__description",
    inputValue: ".add__value",
    addBTN: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetValue: ".budget__value",
    incomeValue: ".budget__income--value",
    expenseValue: ".budget__expenses--value",
    percentageValue: ".budget__expenses--percentage",
    budgetMonth: ".budget__title--month",
    container: ".container",
    expensesPercentageLabel: ".item__percentage"
  };

  // Number Formatting of app
  var formateNumber = function(num, type) {
    var numSplit;
    num = Math.abs(num).toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }
    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  // Hack for convert a nodelist to array
  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    // Get Input Value from UI
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // either inc or exp
        description: document.querySelector(DOMStrings.inputDesciption).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    // Add Input Value into the list items
    addListItem: function(obj, type) {
      var Html, newHtml, element;
      // AddItem HTML Template
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        Html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        Html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //Replace with real items value
      newHtml = Html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formateNumber(obj.value, type));
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    // Delete list item from UI
    deleteListItemUI: function(elementId) {
      var selectedEl = document.getElementById(elementId);
      selectedEl.parentNode.removeChild(selectedEl);
    },

    // Clear All fields after add items
    clearFields: function() {
      var fields, fieldsArray;
      fields = document.querySelectorAll(
        DOMStrings.inputDesciption + "," + DOMStrings.inputValue
      );
      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArray[0].focus();
    },

    // Display Budget on UI
    displayBudget: function(obj) {
      var type = obj.budget > 0 ? "inc" : "exp";
      document.querySelector(DOMStrings.budgetValue).textContent =
        obj.budget === 0 ? "0.00" : formateNumber(obj.budget, type);
      document.querySelector(
        DOMStrings.incomeValue
      ).textContent = formateNumber(obj.totalInc, "inc");
      document.querySelector(
        DOMStrings.expenseValue
      ).textContent = formateNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageValue).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageValue).textContent = "---";
      }
    },

    // Display Percentages
    displayPercentages: function(percen) {
      var fields = document.querySelectorAll(
        DOMStrings.expensesPercentageLabel
      );

      nodeListForEach(fields, function(cur, index) {
        if (percen[index] > 0) {
          cur.textContent = percen[index] + "%";
        } else {
          cur.textContent = "--";
        }
      });
    },

    // Display Month
    displayMonth: function() {
      var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      var date = new Date();
      var year = date.getFullYear();
      var month = monthNames[date.getMonth()];
      document.querySelector(DOMStrings.budgetMonth).textContent =
        month + "-" + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDesciption +
          "," +
          DOMStrings.inputValue
      );
      nodeListForEach(fields, function(cur, index) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMStrings.addBTN).classList.toggle("red");
    },

    // Get Dom Strings
    getDomStrings: function() {
      return DOMStrings;
    }
  };
})();

var controller = (function(budgetCtrl, UICtrl) {
  // Event Listner for setup
  var setupEventListner = function() {
    var DOM = UICtrl.getDomStrings();

    document.querySelector(DOM.addBTN).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDelItems);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };
  // Update Budget
  var updateBudget = function() {
    // Calculate Budget
    budgetCtrl.calculateBudget();
    // Return Budget
    var budget = budgetCtrl.getBudget();
    // Display Budget on UI
    UICtrl.displayBudget(budget);
  };

  // Update percentages
  var updatePercentages = function() {
    // Calculate percentages
    budgetCtrl.calculatePercentage();
    // fetch it from budgetController
    var percentages = budgetCtrl.getPercentage();

    // update and show on UI
    UICtrl.displayPercentages(percentages);
  };

  //All add items for controller
  var ctrlAddItem = function() {
    var input, newItem;
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // Add new item in list
      UICtrl.addListItem(newItem, input.type);
      // Clear input field and auto focus
      UICtrl.clearFields();
      // Update budget and budget UI
      updateBudget();
      // Update percentages and its UI
      updatePercentages();
    }
  };

  // Delete items
  var ctrlDelItems = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // Delete the item from data structure
      budgetCtrl.deleteItem(type, ID);
      // Delete that item list from UI
      UICtrl.deleteListItemUI(itemID);
      // Update budget and budget UI
      updateBudget();
      // Update percentages and its UI
      updatePercentages();
    }
  };

  return {
    // Initial Function
    init: function() {
      console.log("App Started...");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        totalInc: 0,
        totalExp: 0,
        budget: 0,
        percentage: -1
      });
      setupEventListner();
    }
  };
})(budgetController, UIController);
controller.init();
