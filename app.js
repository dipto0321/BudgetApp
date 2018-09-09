var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
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
    percentage: -1,
    month: ""
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
        ata.percentage = -1;
      }
    },

    // Get budget
    getBudget: function() {
      return {
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        budget: data.budget,
        percentage: data.percentage,
        monthName: data.month
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
    container: ".container"
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
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        Html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //Replace with real items value
      newHtml = Html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
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
      document.querySelector(DOMStrings.budgetValue).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeValue).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expenseValue).textContent =
        obj.totalExp;
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageValue).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageValue).textContent = "---";
      }
      document.querySelector(DOMStrings.budgetMonth).textContent =
        obj.monthName;
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

  //All add items for controller
  var ctrlAddItem = function() {
    var input, newItem;
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();
      updateBudget();
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
      // Update budget and budget UI
    } else {
    }
  };

  return {
    // Initial Function
    init: function() {
      console.log("App Started...");
      UICtrl.displayBudget({
        totalInc: 0,
        totalExp: 0,
        budget: 0,
        percentage: -1,
        monthName: ""
      });
      setupEventListner();
    }
  };
})(budgetController, UIController);
controller.init();
