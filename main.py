# This is a sample Python script.

# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.
import json # Импорт модуля для работы с файлом, где будет записаны правила

class Facts_Bank:
    ops = { # Cоздание словаря
        'and': [2, lambda x, y: x and y],
        'or': [2, lambda x, y: x or y],
        'not': [1, lambda x: not x]
    }

    def __init__(self):
        self.working_space = {}  # fact:parameter
        self.__last_fact = None

    def is_true(self, antecedent):
        stack = []
        for elem in antecedent:
            if elem['fact'] in Facts_Bank.ops:
                op = Facts_Bank.ops[elem['fact']]
                stack.append(op[1](*(stack.pop() for i in range(op[0]))))
            else:
                fact_true_false = elem['fact'] in self.working_space and \
                                  (not elem['parameter']['required'] or elem['parameter']['required']
                                   and elem['parameter']['value'] == self.working_space[elem['fact']])
                stack.append(fact_true_false)
        return stack.pop()

    def add_fact(self, qonsequent):
        values = list(qonsequent['value'])
        if len(values) > 1:
            value = self.ask_question(qonsequent['question'], values)
        else:
            value = values[0]
        fact = qonsequent['fact']
        self.working_space[fact] = value
        self.__last_fact = (fact,value)

    def ask_question(self, question, answers):
        answer = ''
        while not answer in answers:
            answer = input('{} ({}) '.format(question, ','.join(answers)))
        return answer

    def fact_present(self, fact_name):
        return fact_name in self.working_space

    @property
    def last_fact(self):
        return f'{self.__last_fact[0]} : {self.__last_fact[1]}'

def print_hi(name):
    # Use a breakpoint in the code line below to debug your script.
    print(f'Hi, {name}')  # Press Ctrl+F8 to toggle the breakpoint.


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    with open('kb.json', 'r') as kb_file: # Открытие файла для чтения при помощи файлового потока
        rules = json.load(kb_file)['rules'] # Парсинг json файла
        fb = Facts_Bank() # Инициализация класса
        used_rules=[]
        while True: # Цикл для обработки
            accepted_rules = []
            for rule in rules:
                if fb.is_true(rules[rule]['antecedent']):
                    accepted_rules.append(rule)
            if not accepted_rules:
                break
            active_rule = max(accepted_rules, key=lambda x: not (x in used_rules))  # TODO
            active_fact = rules[active_rule]['qonsequent']
            if fb.fact_present(active_fact['fact']):
                break
            fb.add_fact(active_fact)
            used_rules.append(active_rule)
        print(fb.last_fact)


# See PyCharm help at https://www.jetbrains.com/help/pycharm/
