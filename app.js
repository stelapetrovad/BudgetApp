// BUDGET CONTROLLER
var budgetController = (function() { //modul budgetController
    
//konstruktura pishem s glavna bukva
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    
//this method calculates the percenteges
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

//returns the percentege
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) { //shte obhodim celiq masiv chrez foreach i gi saberem v nova promenliva sum
            sum = sum + cur.value;
        });
        data.totals[type] = sum; //zapisvame go globalno v data structure
    };

 //tuk shte zapisvame data, private
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1

    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID; //that's how we create new items

            //ID = last ID + 1
            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem); //dobavqme nov item

            //Return the new element
            return newItem;
        },


        deleteItem: function(type, id) {

            // id = 3
            //data.allItems[type][id]; 

            var ids = data.allItems[type].map(function(current) { //map vrashta chisto nov array

                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },


        calculateBudget: function() {

            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc'); 

            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {//da se izpalni samo ako ima nqkakav income
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            //Expense = 100 and income 200, spent 50% = 100/200 = 0.5 * 100
        },

        calculatePercentages: function() {
            
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },

        //!!! map returns something ans stores the variable, while forEach doesn't
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget, 
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function() {
            console.log(data);
        }
    }

})();


// UI CONTROLLER
var UIController = (function() { //modul UIController

    var DOMstrings = { //definirame si vsichki id-ta tuk, posle ako se promenq neshto promenqme samo tuk 
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel:'.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        // + or - before the number
        // exactly 2 decimal points
        // comma separating the thousands

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length); //start at position 0 and read 1 numbers; start at position 1 and read 3 numbers;
        } //input 23510, output: 23,510

        dec = numSplit[1];

        //type == 'exp' ? sign = '-' : sign = '+';

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    return {
        getInput: function() { //method s koito shte varnem vsichkite 3 input-a koito ni trqbvat
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //parsefloat convert-va ot string v float number
            };
        },

        addListItem: function(obj, type) {

            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },


        deleteListItem: function(selectorID) {

            var el =  document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },


        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr =  Array.prototype.slice.call(fields); //preobrazuvane v array

            fieldsArr.forEach(function(current, index, array) { //forEach metoda obhojda celiq array i go nulira
                current.value = ""; //zanulqva go
           });

           fieldsArr[0].focus(); // pri vavejdane v descriptiona i values, sled natiskane na enter, focusa da se varne pri description-a
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type); //taka shte vizualizirame budget-a
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }


        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); //node list

            var nodeListforEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };


            nodeListforEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });

        },

        displayMonth: function() {
            var now, month, months, year;

            var now = new Date();
            //var christmas = new Date(2020, 11, 25);

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        /*
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        */

        getDOMstrings: function() { //taka si gi pravim public kato gi vrashtame izvan funkciqta
            return DOMstrings; 
        }
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        //dobavqne na event listener kam add butona
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };


    var updateBudget = function() {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    }

    var updatePercentages = function() {

        // 1. Calculate the percentegaes
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percenteges
        UICtrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function() {
        var input, newItem;

        //1. Get the filed input data
        input = UICtrl.getInput();  
        //console.log(input);

        //pravim proverki!! dali description-a e prazen pri insert i dali value-to e chislo i dali e po golqmo ot 0
        if(input.description !== "" && !isNaN(input.value) && input.value > 0 ) {

            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and updade budget
            updateBudget(); 

            //6. Calculate and update percentages
            updatePercentages();
        }         
    };


    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //tochnoto mqsto kaeto klika mishkata

        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-'); //taka go razdelqme i stava: ["inc", "1"]
            type = splitID[0]; //type is income or expense
            ID = parseInt(splitID[1]); //convert string into integer


            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentagas
            updatePercentages();

        }

    };

    return { //init function
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0, 
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners(); //eventlisteners will be set up as soon as we call the init function
        }
    };

   

})(budgetController, UIController); //assign to the budgetController and UIController

controller.init(); //vikame go izvan vsichko