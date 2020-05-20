var budgetController = (function() { //modul budgetController

    var x = 23;

    var add = function(a) {
        return x + a;
    }

    return { //blagodarenie na closers imame dostap do X(koito ppc e private)
        publicTest: function(b) { //publicTest e metod, dostapvame private values
            return add(b);
        }
    }

})();


var UIController = (function() { //modul UIController

    //some code

})();


var controller = (function(budgetCtrl, UICtrl) {
//we will pass the other two modules as arguments to the controller
//so that this controller knows about the other two and can connect them

    var z = budgetCtrl.publicTest(3);

    return {
        anotherPublic: function() {
            console.log(z);
        }
    }

})(budgetController, UIController); //assign to the budgetController and UIController