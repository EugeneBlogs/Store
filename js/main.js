table1.onclick = function (e) {
    if (e.target.tagName != 'TH') return
    let th = e.target
    sortTable(th.cellIndex, th.dataset.type, 'table1')
}
table2.onclick = function (e) {
    if (e.target.tagName != 'TH') return
    let th = e.target
    sortTable(th.cellIndex, th.dataset.type, 'table2')
}

function sortTable(colNum, type, id) {
    let elem = document.getElementById(id)
    let tbody = elem.querySelector('tbody')
    let rowsArray = Array.from(tbody.rows)
    let compare
    switch (type) {
        case 'number':
            compare = function (rowA, rowB) {
                return rowA.cells[colNum].innerHTML - rowB.cells[colNum].innerHTML
            }
            break
        case 'string':
            compare = function (rowA, rowB) {
                return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML ? 1 : -1
            }
            break
    }
    rowsArray.sort(compare)
    tbody.append(...rowsArray)
}

if (!localStorage.getItem('goods')) {
    localStorage.setItem('goods', JSON.stringify([]))
}

let result_price = 0

let myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
    keyboard: false
})
let options = {
    valueNames: ['article', 'name', 'price', 'category']
}
let userList

document.querySelector('button.add_new').addEventListener('click', function (e) {
    let article = document.getElementById('good_article').value
    let name = document.getElementById('good_name').value
    let price = document.getElementById('good_price').value
    let count = document.getElementById('good_count').value
    let category = document.getElementById('good_category').value
    let goods = JSON.parse(localStorage.getItem('goods'))
    let error = false;
    for (let i = 0; i < goods.length; i++) {
        if (article == goods[i][8]) {
            error = true;
        }
    }
    if (error == false) {
        if (article && name && price && count && category) {
            document.getElementById('good_article').value = ''
            document.getElementById('good_name').value = ''
            document.getElementById('good_price').value = ''
            document.getElementById('good_count').value = '1'
            document.getElementById('good_category').value = ''
            let goods = JSON.parse(localStorage.getItem('goods'))
            goods.push(['good_' + goods.length, name, price, count, 0, 0, 0, category, article])
            localStorage.setItem('goods', JSON.stringify(goods))
            update_goods()
            myModal.hide()
            Swal.fire({
                icon: 'success',
                title: 'Товар успешно добавлен!',
                text: 'Информация: Артикул - ' + article + ', Название - ' + name + ', Цена - ' + price + ', Количество - ' + count + ', Категория - ' + category + '.',
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Пожалуйста, заполните все поля!',
            })
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Ошибка',
            text: 'Товар с данным артикулом уже существует!',
        })
    }
})

document.querySelector('a.help_article').addEventListener('click', function (e) {
    let result = "";
    for (let i = 0; i < 15; i++) {
        result += getRandom(0, 10);
    }
    document.getElementById('good_article').value = result
})

function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

update_goods()

function update_goods() {
    result_price = 0
    let tbody = document.querySelector('.list')
    tbody.innerHTML = ""
    document.querySelector('.cart').innerHTML = ""
    let goods = JSON.parse(localStorage.getItem('goods'))
    if (goods.length) {
        table1.hidden = false
        table2.hidden = false
        for (let i = 0; i < goods.length; i++) {
            tbody.insertAdjacentHTML('beforeend',
                `
            <tr class="align-middle">
            <td>${i + 1}</td>
            <td class="article">${goods[i][8]}</td>
            <td class="name">${goods[i][1]}</td>
            <td class="price">${goods[i][2]}</td>
            <td>${goods[i][3]}</td>
            <td class="category">${goods[i][7]}</td>
            <td><button class="good_delete btn-danger" data-delete="${goods[i][0]}" title="Удалить товар из списка">&#10006;</button></td>
            <td><button class="good_delete btn-primary" data-goods="${goods[i][0]}" title="Перенести товар в корзину (одну штуку)">&#10149;</button></td>
            </tr>
            `
            )
            if (goods[i][4] > 0) {
                goods[i][6] = goods[i][4] * goods[i][2] - goods[i][4] * goods[i][2] * goods[i][5] * 0.01
                result_price += goods[i][6]
                document.querySelector('.cart').insertAdjacentHTML('beforeend',
                    ` 
                <tr class="align-middle">
                <td>${i + 1}</td>
                <td class="price_article">${goods[i][8]}</td>
                <td class="price_name">${goods[i][1]}</td>
                <td class="price_one">${goods[i][2]}</td>
                <td class="price_count">${goods[i][4]}</td>
                <td class="price_discount"><input class="discount" data-goodid="${goods[i][0]}" type="text" value="${goods[i][5]}" min="0" max="100"></td>
                <td>${goods[i][6]}</td>
                <td><button class="good_delete btn-danger" data-delete="${goods[i][0]}" title="Вернуть товар из корзины в список (одну штуку)">&#10006;</button></td>
                </tr>      
                `)
            }
        }
        userList = new List('goods', options);
    } else {
        table1.hidden = true;
        table2.hidden = true;
    }
    document.querySelector('.price_result').innerHTML = result_price + '&#8381;'
}

document.querySelector('.list').addEventListener('click', function (e) {
    if (!e.target.dataset.delete) {
        return
    }
    Swal.fire({
        title: 'Внимание!',
        text: 'Вы действительно хотите удалить товар?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Да',
        cancelButtonText: 'Нет',
    }).then((result) => {
        if (result.isConfirmed) {
            let goods = JSON.parse(localStorage.getItem('goods'))
            for (let i = 0; i < goods.length; i++) {
                if (goods[i][0] == e.target.dataset.delete) {
                    goods.splice(i, 1)
                    localStorage.setItem('goods', JSON.stringify(goods))
                    update_goods()
                }
            }
            Swal.fire(
                "Удалено!",
                "Выбранный товар был успешно удалён!",
                "success"
            )
        }
    })
})

document.querySelector('.list').addEventListener('click', function (e) {
    if (!e.target.dataset.goods) {
        return
    }
    let goods = JSON.parse(localStorage.getItem('goods'))
    for (let i = 0; i < goods.length; i++) {
        if (goods[i][0] == e.target.dataset.goods) {
            if (goods[i][3] > 0) {
                goods[i].splice(3, 1, goods[i][3] - 1)
                goods[i].splice(4, 1, goods[i][4] + 1)
                localStorage.setItem('goods', JSON.stringify(goods))
                update_goods()
            } else {
                Swal.fire(
                    "Товар закончился!",
                    "Количество выбранного товара = 0.",
                    "info"
                )
            }
        }
    }
})

document.querySelector('.cart').addEventListener('click', function (e) {
    if (!e.target.dataset.delete) {
        return
    }
    let goods = JSON.parse(localStorage.getItem('goods'))
    for (let i = 0; i < goods.length; i++) {
        if (goods[i][4] > 0 && goods[i][0] == e.target.dataset.delete) {
            goods[i].splice(3, 1, goods[i][3] + 1)
            goods[i].splice(4, 1, goods[i][4] - 1)
            localStorage.setItem('goods', JSON.stringify(goods))
            update_goods()
        }
    }
})

document.querySelector('.cart').addEventListener('input', function (e) {
    if (!e.target.dataset.goodid) {
        return
    }
    let goods = JSON.parse(localStorage.getItem('goods'))
    for (let i = 0; i < goods.length; i++) {
        if (goods[i][0] == e.target.dataset.goodid) {
            goods[i][5] = e.target.value
            goods[i][6] = goods[i][4] * goods[i][2] - goods[i][4] * goods[i][2] * goods[i][5] * 0.01
            localStorage.setItem('goods', JSON.stringify(goods))
            update_goods()
            let input = document.querySelector(`[data-goodid="${goods[i][0]}"]`)
            input.focus()
            input.selectionStart = input.value.length
        }
    }
})

function DeleteAll() {
    Swal.fire({
        title: 'Вы точно хотите очистить список товаров?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: 'green',
        confirmButtonText: 'Да, очистить.',
        cancelButtonText: 'Нет, оставить.'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            localStorage.setItem('goods', JSON.stringify([]))
            update_goods()
            Swal.fire(
                'Удалено!',
                'Все товары удалены.',
                'success'
            )
        }
    })
}

function DeleteAllCart() {
    Swal.fire({
        title: 'Вы точно хотите вернуть все товары из корзины в список?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: 'green',
        confirmButtonText: 'Да, вернуть их.',
        cancelButtonText: 'Нет, оставить их.'
    }).then((result) => {
        if (result.isConfirmed) {
            let goods = JSON.parse(localStorage.getItem('goods'))
            for (let i = 0; i < goods.length; i++) {
                if (goods[i][4] > 0) {
                    while (goods[i][4] > 0) {
                        goods[i].splice(3, 1, goods[i][3] + 1)
                        goods[i].splice(4, 1, goods[i][4] - 1)
                    }
                    localStorage.setItem('goods', JSON.stringify(goods))
                    update_goods()
                }
            }
            Swal.fire(
                'Удалено!',
                'Все товары из корзины возварщены в список.',
                'success'
            )
        }
    })
}
function DeleteAllCartForever() {
    Swal.fire({
        title: 'Вы точно хотите удалить все товары из корзины?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: 'green',
        confirmButtonText: 'Да, удалить их.',
        cancelButtonText: 'Нет, оставить их.'
    }).then((result) => {
        if (result.isConfirmed) {
            let goods = JSON.parse(localStorage.getItem('goods'))
            for (let i = 0; i < goods.length; i++) {
                if (goods[i][4] > 0) {
                    while (goods[i][4] > 0) {
                        goods[i].splice(4, 1, goods[i][4] - 1)
                    }
                    localStorage.setItem('goods', JSON.stringify(goods))
                    update_goods()
                }
            }
            Swal.fire(
                'Удалено!',
                'Все товары из корзины удалены.',
                'success'
            )
        }
    })
}

function validate(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }
}

document.querySelector(".print-button").onclick = function () {
    document.body.classList.add("print");
    window.print();
};
window.onafterprint = function(){
    document.body.classList.remove("print");
}

function readFile(input) {
    let file = input.files[0];
    let names = file.name.split('.')
    if (names[names.length - 1] == "txt") {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
            let array = reader.result.split("\n")
            for (let i = 0; i < array.length; i++) {
                let array_2 = array[i].split(',')
                let article = array_2[0]
                let name = array_2[1]
                let price = array_2[2]
                let count = array_2[3]
                let category = array_2[4]
                let goods = JSON.parse(localStorage.getItem('goods'))
                let error = false;
                for (let i = 0; i < goods.length; i++) {
                    if (article == goods[i][8]) {
                        error = true;
                    }
                }
                if (error == false) {
                    if (article && name && price && count && category) {
                        let goods = JSON.parse(localStorage.getItem('goods'))
                        goods.push(['good_' + goods.length, name, price, count, 0, 0, 0, category, article])
                        localStorage.setItem('goods', JSON.stringify(goods))
                        update_goods()
                    } else {
                        alert(`Товар "${name}" не добавлен. Заполните все поля.`)
                    }
                } else {
                    alert(`Товар с артикулом "${article}" уже существует.`)
                }
            }
            alert(`Товары из файла успешно загружены.`)
            update_goods()
        };
    } else {
        Swal.fire(
            'Данный формат не поддерживается!',
            'Пожалуйста, загрузите файл формата "txt".',
            'warning'
        )
    }
}

document.querySelector(".save-goods").onclick = function () {
    let goods = JSON.parse(localStorage.getItem('goods'))
    let stroka = "";
    for (let i = 0; i < goods.length; i++) {
        stroka += `${goods[i][8]},${goods[i][1]},${goods[i][2]},${goods[i][3]},${goods[i][7]}\n`
    }
    let blob = new Blob([stroka], { type: "text/plain" });
    let link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `Сверка товаров за ${new Date().getDate()}-${eval(new Date().getMonth() + 1)}-${new Date().getFullYear()} ${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}.txt`);
    link.click();
};

document.querySelector(".money-button").onclick = function () {
    Swal.fire({
        title: 'Внесённая сумма',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off',
            value: Number(document.querySelector(".price_result").innerHTML.substring(0, document.querySelector(".price_result").innerHTML.length - 1))
        },
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: 'red',
        confirmButtonText: 'Внести',
        cancelButtonText: 'Отменить',
        preConfirm: (Entered) => {
            let change = eval(Number(Entered) - Number(document.querySelector(".price_result").innerHTML.substring(0, document.querySelector(".price_result").innerHTML.length - 1)))
            Swal.fire(
                `Сдача: ${change}₽`,
                'Расчёт завершён.',
                'info'
            )
        }
    })
};

function Generate() {
    document.getElementById("qr").innerHTML = ""
    new QRCode(document.getElementById("qr"), document.getElementById("user-text-qr").value)
}
