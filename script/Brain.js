//Реализация основной функции (ссылки на объекты)
var Brain = (function () {

    function Brain(brainData) {
        this.Layers = []; //создание слоя

        if (brainData !== null) {
            for (var i = 0; i < brainData.Layers.length; i++) {
                var layerData = brainData.Layers[i];
                var layer = new Layer();
                this.Layers.push(layer);
                for (var j = 0; j < layerData.Neurons.length; j++) {
                    var neuronData = layerData.Neurons[j];
                    var neuron = new Neuron();
                    neuron.AxonValue = neuronData.AxonValue;
                    neuron.Name = neuronData.Name;
                    layer.Neurons.push(neuron);
                    if (i > 0) {
                        //Соединений нейронов с другими на предыдущем слое
                        this.Layers[i - 1].ConnectNeuron(neuron);
                    }
                    //Установка веса
                    for (var k = 0; k < neuronData.Dendrites.length; k++) {
                        neuron.Dendrites[k].Weight = neuronData.Dendrites[k].Weight;
                    }
                }

            }
        }
    }

    //Для запуска сети вызов метода каждого слоя
    Brain.prototype.Think = function () {
        for (var i = 0; i < this.Layers.length; i++) {
            this.Layers[i].Think();
        }
    };

    //Обработка выходного нейрона
    Brain.prototype.Train = function (inputData, outputNeuron) {

        if (this.Layers.length === 0) {
            return;
        }

        //Заполнение первого слоя для подачи в сеть
        var inputLayer = this.Layers[0];
        for (var i = 0; i < inputData.length; i++) {
            inputLayer.Neurons[i].AxonValue = inputData[i];
        }

        //Генерация выходных данных
        this.Think();

        //Регуляция значений при помощи дельты
        //Вычитание представляет собой ошибку, которая и  будет исправлена путем корректировки веса
        var delta = 0;
        var learningRate = 0.01;
        for (var i = 0; i < outputNeuron.Dendrites.length; i++) {
            var dendrite = outputNeuron.Dendrites[i];
            delta = parseFloat(Math.max(inputData[i], 0) - outputNeuron.AxonValue);
            dendrite.Weight += parseFloat(Math.max(inputData[i], 0) * delta * learningRate);
        }
    }
    return Brain;
})();

//Слой представляет собой набор нейронов
var Layer = (function () {

    function Layer(neuronCount) {
        var neuronsToAdd = typeof neuronCount !== "undefined" ? neuronCount : 0;
        this.Neurons = [];

        //Создание объектов
        for (var i = 0; i < neuronsToAdd; i++) {
            this.Neurons.push(new Neuron());
        }
    }

    //Все нейроны генерирую выходное значение
    Layer.prototype.Think = function () {
        for (var i = 0; i < this.Neurons.length; i++) {
            this.Neurons[i].Think();
        }
    };

    //Соединяет нейрон из другого слоя со всеми нейронами в этом слое
    Layer.prototype.ConnectNeuron = function (neuron) {
        for (var i = 0; i < this.Neurons.length; i++) {
            neuron.Dendrites.push(new Dendrite(this.Neurons[i]))
        }
    };

    //Поиск нейрона по имени
    Layer.prototype.GetNeuron = function (name) {
        for (var i = 0; i < this.Neurons.length; i++) {
            if (this.Neurons[i].Name.toUpperCase() === name.toUpperCase()) {
                return this.Neurons[i];
            }
        }
        return null;
    };

    //Возвращает нейрон с наибольшим значением аксона в этом слое
    Layer.prototype.BestGuess = function () {
        var max = 0;
        var bestGuessIndex = 0;

        //Нахождение индекса нейрона с наибольшим значением аксона
        for (var i = 0; i < this.Neurons.length; i++) {
            if (this.Neurons[i].AxonValue > max) {
                max = this.Neurons[i].AxonValue;
                bestGuessIndex = i;
            }
        }
        return this.Neurons[bestGuessIndex];
    }
    return Layer;}
)();

//Нейрон-вычислительной единицей и отвечает за генерацию выходного значения.
// Реализация функции
var Neuron = (function () {

    //Функция-конструктор, на входе получает name
    function Neuron(name) {
        this.Name = name;
        this.Dendrites = [];
        this.AxonValue = 0.5;
    }

    //Генерация выходного значение (входные значения на соответ. вес)
    //Выходное значение находится в пределах 0 и 1
    Neuron.prototype.Think = function () {
        var sum = 0;
        if (this.Dendrites.length > 0) {
            for (var i = 0; i < this.Dendrites.length; i++) {
                sum += this.Dendrites[i].SourceNeuron.AxonValue * this.Dendrites[i].Weight;
            }

            //Применение встроенной функции для преобразования суммы
            this.AxonValue = 1 / (1 + Math.exp(-sum));
        }
    };
    return Neuron;
}
)();

//Дендрит представляет собой входное соединение с нейроном.
//Исходный нейрон, к которому он подключен, должен быть передан через конструктор.
var Dendrite = (function () {
    function Dendrite(sourceNeuron) {
        this.SourceNeuron = sourceNeuron;
        this.Weight = 0;
    }
    return Dendrite;
}
)();
