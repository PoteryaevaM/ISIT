//Создание глобальных переменных
var brain = new Brain(BRAIN_ABC);

//Обработчик события по нажатию кнопки
function readDrawing() {
    //Уменьшение размера рисунка до сетки 15x15, для того, чтобы в переменной 255 элементов с нулями и единицами
    var drawing = getDownsampledDrawing();

    //inputLayer- это первый слой, outputLayer- последний
    var inputLayer = brain.Layers[0];
    var outputLayer = brain.Layers[brain.Layers.length - 1];

    //Заполнение первого входного слоя
    for (var i = 0; i < drawing.length; i++) {
        inputLayer.Neurons[i].AxonValue = drawing[i];
    }

    //Вызов метода
    brain.Think();

    $("#outputValues").html("<h3>Output values</h3>");
    for (var i = 0; i < outputLayer.Neurons.length; i++) {
        var neuron = outputLayer.Neurons[i];
        $("#outputValues").append("<span>" + neuron.Name.toUpperCase() + ": " + neuron.AxonValue + "</span>");
    }
    var bestGuess = outputLayer.BestGuess();
    if (bestGuess !== null) {
        $("#bestGuess").text(bestGuess.Name.toUpperCase());

    }
    else {
        $("#outputValues").html("Could not read your drawing.");
    }

}

//Функция запуска
function trainCharacter() {
    var inputLayer = brain.Layers[0];
    var outputLayer = brain.Layers[brain.Layers.length - 1];

    //Определение символа
    var character = $("#txtCharacter").val().toUpperCase();
    if (character.length === 0) {
        return;
    }

    //Нахождение выходного нейрона
    var outputNeuron = outputLayer.GetNeuron(character);

    //Если отсутствует значение, то добавление на выходной слой
    if (outputNeuron === null) {
        var outputNeuron = new Neuron(character)
        inputLayer.ConnectNeuron(outputNeuron);
        outputLayer.Neurons.push(outputNeuron);
    }

    //Обучение по текущему рисунку
    brain.Train(getDownsampledDrawing(), outputNeuron);
}
