var budgetController = (function() {

    // constructor of expenses
    var Expences = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    // constructor of income
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // prototype of expenses
    Expences.prototype.calcPercentages = function(totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round(this.value * 100 / totalIncome);
        else
            this.percentage = -1;
    };
    Expences.prototype.getPercentages = function() {
        return this.percentage;
    };



    var calculateTotal = function(type) {
            var sum = 0;
            data.allItems[type].forEach(function(curr) {
                sum += curr.value;
            })

            data.totals[type] = sum;
        }
        // data structure to store the data 
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
        percentage: 0
    };

    return {

        addItems: function(type, des, value) {
            var newItem, ID;
            // ceate id for new item
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;
            //create new item according to type
            if (type === 'inc')
                newItem = new Income(ID, des, value);
            else if (type === 'exp')
                newItem = new Expences(ID, des, value);

            //add data to our data structure
            data.allItems[type].push(newItem);
            //return the new item
            return newItem;
        },
        deleteItems: function(type, id) {
            var ids, index;
            // map is a loopig method similar to for-each loop and the difference is that map method returns a brand new array
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            // splice(startingIndex , no. of elements) is a method to delete elements from an array 
            // don't get confused with slice method . slice method is used to copy the elements 
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            //calculate total income and expenses 
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentage of income which spent as expenses
            if (data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp * 100) / data.totals.inc);
            else
                data.percentage = -1;
        },


        // here we are calculatuin the percentages of all items
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentages(data.totals.inc);
            });
        },

        // here we return the percemtages of al items
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentages();
            });

            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalExpenses: data.totals.exp,
                totalIncome: data.totals.inc,
                percentage: data.percentage
            }
        },
        testing: function() {
            console.log(data);
        }


    };

})();


var UIController = (function() {

    //some code
    var DomString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        container: '.container',
        expensesPercenLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    formatNumber = function(num, type) {
        var int, dec, numSplit;
        // place sign before number either '+' or '-'
        // take number only after twom decimal places
        // separte number by commas loke 2,34,567.90

        // we calculte the absolite part of num
        num = Math.abs(num);

        // fixed the number only at two decimal places we use a method (toFixed(number of places after decimal points))
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3)
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        return (type === 'inc' ? '+' : '-') + int + '.' + dec;


    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DomString.inputType).value,
                description: document.querySelector(DomString.inputDescription).value,
                // now we want the value should be number then we "parsefloat" to convert a string into a number
                value: parseFloat(document.querySelector(DomString.inputValue).value)
            };
        },

        addListItems: function(object, type) {
            var html, newhtml, element;
            //create html string with placeholder text
            if (type === 'inc') {
                element = DomString.incomeContainer;
                html = ' <div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>'
            } else if (type === 'exp') {
                element = DomString.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // replace the placeholder with some real text
            newhtml = html.replace('%id%', object.id);
            newhtml = newhtml.replace('%description%', object.description);
            newhtml = newhtml.replace('%value%', formatNumber(object.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
        },

        deleteListItems: function(selectorId) {
            // here we can remove items from ui using dom
            // document.getElementById(selectorId).style.display = 'none';
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearfields: function() {
            var field, fieldarr;
            // select all the items to delete
            field = document.querySelectorAll(DomString.inputDescription + ',' + DomString.inputValue);
            // querySelectorAll does't return an array but it return a list and slice is a method which return a copy of array on which it is called
            // slice methos is generally called on array but we can call it on list and it will return an array by a trick which is following
            fieldarr = Array.prototype.slice.call(field);

            // use of for each loop for clearong the fields
            fieldarr.forEach(function(current, index, array) {
                current.value = "";
            });
            // now we want to focus back on description fields 
            fieldarr[0].focus();
        },

        displaybudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type);
            document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExpenses, 'exp');
            document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalIncome, 'inc');
            if (obj.percentage > 0)
                document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + "%";
            else
                document.querySelector('.budget__expenses--percentage').textContent = '---'
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DomString.expensesPercenLabel);
            // now we know that this will return a nodelist but we also know that forEach loop does not work on nodelist

            var nodeListFOrEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListFOrEach(fields, function(current, index) {
                if (percentages[index] > 0)
                    current.textContent = percentages[index] + "%";
                else
                    current.textContent = '---';
            });

        },

        // now calcolate the yearand month
        displayMonth: function() {
            var now, year, mont;
            now = new Date();
            year = now.getFullYear;
            document.querySelector
        },

        getDomString: function() {
            return DomString;
        }

    };

})();

var controller = (function(budgetctrl, uictrl) {
    // set event listners
    var setEventListners = function() {
        var Dom = uictrl.getDomString();

        document.querySelector('.add__btn').addEventListener('click', ctrlAddItems);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13)
                ctrlAddItems();

            document.querySelector('.container').addEventListener('click', ctrlDeleteItem);
        });

    };

    var updateBudget = function() {
        // calculATE THE BUDGET 
        budgetctrl.calculateBudget();
        // return the budget
        var budget = budgetctrl.getBudget();
        // update the budget in UI
        // console.log(budget);
        uictrl.displaybudget(budgetctrl.getBudget());
    };

    var updatePercentages = function() {
        // calculate prcentages
        budgetctrl.calculatePercentages();
        // read the percentages from budgetcontrooler 
        var percentages = budgetctrl.getPercentages();
        // update the percentages in UI
        uictrl.displayPercentages(percentages);
    };
    var ctrlAddItems = function() {

        //TO Do list
        var input, newitem;
        //1. get input data from input fields
        input = uictrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. add items to budget controller
            newitem = budgetctrl.addItems(input.type, input.description, input.value);

            //3. add items to ui
            UIController.addListItems(newitem, input.type);

            // 4.clear the fields
            uictrl.clearfields();
            //5. calculate budget and  display budget
            updateBudget();

            // 6. update the percentages in UI
            updatePercentages();


        }
    };

    // event delegation is when we attach a eventListner with an parent node insted of that element with which we wonna attach the event listner 
    //and through target property we can attach this eventLstner with our desired elemnt (child element )
    // through target.parentNode we can reach on nearest parent element 
    var ctrlDeleteItem = function(event) {
        var itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            //TO DO LIST
            //1. delete the items from data structure
            budgetctrl.deleteItems(type, ID);
            //2. delete the items from the user interface
            uictrl.deleteListItems(itemId);
            //3. update the budget 
            updateBudget();
            //4. display budget in ui
            uictrl.displaybudget(budgetctrl.getBudget());

            //5. update the percentages in UI
            updatePercentages();

        }
    };

    return {
        init: function() {
            console.log("app has started");
            uictrl.displaybudget({
                budget: 0,
                totalExpenses: 0,
                totalIncome: 0,
                percentage: 0
            });
            setEventListners();
        }
    };


})(budgetController, UIController);

controller.init();