function testFunction() {
    var message = "Hello, world!";
    console.log(message);

    for (var i = 0; i < 10; i++) {
        if (i % 2 === 0) {
            console.log(i + " is even");
        } else {
            console.log(i + " is odd");
        }
    }

    return {
        name: "Test Object",
        value: 42,
        getMessage: function() {
            return message;
        }
    };
}

var result = testFunction();
console.log(result.name);
console.log(result.value);
console.log(result.getMessage());