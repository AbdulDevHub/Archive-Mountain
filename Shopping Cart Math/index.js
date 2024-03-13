function roll(min, max, floatFlag) {
    let r = Math.random() * (max - min) + min
    return floatFlag ? r : Math.floor(r)
}

let possibleProducts = ["🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🥝", "🍅", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶", "🥒", "🥬", "🥦"]

let products = [...Array(5)].map((_, i) => {
    return {
        index: i,
        title: possibleProducts[roll(0, possibleProducts.length)],
        price: roll(2, 10, 1).toFixed(2),
        // weight between 6oz and 20oz
        // round to the nearest 100th
        weight: roll(6, 20, 1).toFixed(2),
        count: roll(1, 6)
    }
})
console.log(products)

let cartTotal = products.reduce(function(accumulator, product) {
    return accumulator + parseFloat(product.price) * product.count 
}, 0).toFixed(2)

let totalWeight = products.reduce(function(accumulator, product) {
    return accumulator + parseFloat(product.weight) * product.count 
}, 0)


let taxRate = roll(5, 9, 1).toFixed(1)

function taxed(value) {
    return taxRate / 100 * cartTotal + parseFloat(cartTotal)
}

let taxedTotal = taxed(cartTotal).toFixed(2)




let cart = document.getElementById("Products")
let cartHtml = ''
products.forEach(product => {
    cartHtml += `<div class="product">
        <div>${product.title}</div>
        <div>💲${product.price}</div>
        <div>x${product.count}</div>
        <div>${product.weight}oz</div>
    </div>`
})
cart.innerHTML = cartHtml

let summary = document.getElementById("Summary")
let summaryHtml = ''
summaryHtml += `<div>Total: 💲${cartTotal}</div>`
summaryHtml += `<div>Tax Rate: ${taxRate}%</div>`
summaryHtml += `<div>Taxed Total: 💲${taxedTotal}</div>`
summaryHtml += `<div>Total Weight: ${totalWeight}oz</div>`
summary.innerHTML = summaryHtml