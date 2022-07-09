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
    valueNames: ['name', 'price', 'category']
}
let userList

document.querySelector('button.add_new').addEventListener('click', function (e) {
    let name = document.getElementById('good_name').value
    let price = document.getElementById('good_price').value
    let count = document.getElementById('good_count').value
    let category = document.getElementById('good_category').value
    if (name && price && count && category) {
        document.getElementById('good_name').value = ''
        document.getElementById('good_price').value = ''
        document.getElementById('good_count').value = '1'
        document.getElementById('good_category').value = ''
        let goods = JSON.parse(localStorage.getItem('goods'))
        goods.push(['good_' + goods.length, name, price, count, 0, 0, 0, category])
        localStorage.setItem('goods', JSON.stringify(goods))
        update_goods()
        myModal.hide()
        Swal.fire({
            icon: 'success',
            title: 'Товар успешно добавлен!',
            text: 'Информация: Название - ' + name + ', Цена - ' + price + ', Количество - ' + count + ', Категория - ' + category + '.',
        })
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Ошибка',
            text: 'Пожалуйста, заполните все поля!',
        })
    }
})

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
                <td class="price_name">${goods[i][1]}</td>
                <td class="price_one">${goods[i][2]}</td>
                <td class="price_count">${goods[i][4]}</td>
                <td class="price_discount"><input data-goodid="${goods[i][0]}" type="text" value="${goods[i][5]}" min="0" max="100"></td>
                <td>${goods[i][6]}</td>
                <td><button class="good_delete btn-danger" data-delete="${goods[i][0]}" title="Удалить товар из корзины (одну штуку)">&#10006;</button></td>
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
        if (goods[i][3] > 0 && goods[i][0] == e.target.dataset.goods) {
            goods[i].splice(3, 1, goods[i][3] - 1)
            goods[i].splice(4, 1, goods[i][4] + 1)
            localStorage.setItem('goods', JSON.stringify(goods))
            update_goods()
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
        title: 'Вы точно хотите удалить все товары?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: 'green',
        confirmButtonText: 'Да, удалить их.',
        cancelButtonText: 'Нет, оставить их.'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Вы точно уверны?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: 'green',
                confirmButtonText: 'Да, удалить их.',
                cancelButtonText: 'Нет, оставить их.'
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
                } else {
                    Swal.fire(
                        'Отменено!',
                        'Операция по удалению товаров отменена!',
                        'error'
                    )
                }
            })
        } else {
            Swal.fire(
                'Отменено!',
                'Операция по удалению товаров отменена!',
                'error'
            )
        }
    })
}

function DeleteAllCart() {
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
            Swal.fire({
                title: 'Вы точно уверны?',
                icon: 'warning',
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
                                goods[i].splice(3, 1, goods[i][3] + 1)
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
                } else {
                    Swal.fire(
                        'Отменено!',
                        'Операция по удалению товаров из корзины отменена!',
                        'error'
                    )
                }
            })
        } else {
            Swal.fire(
                'Отменено!',
                'Операция по удалению товаров из корзины отменена!',
                'error'
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