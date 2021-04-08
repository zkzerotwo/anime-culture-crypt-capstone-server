function makeDropsArray() {
    return [
        {
            id: 1,
            series: "6969",
            description: "A lovely advnture of two lovers star crossed through time.",
            lootbox: 4,
            type: "manga",
            name: "Naruto 2: Electric Boogaloo",
            url: "https://myanimelist.net/manga/42/Dragon_Ball",
            image: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
        },
        {
            id: 2,
            series: "6969",
            description: "A lovely advnture of two lovers star crossed through time.",
            lootbox: 4,
            type: "manga",
            name: "Naruto 2: Electric Boogaloo",
            url: "https://myanimelist.net/manga/42/Dragon_Ball",
            image: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
        },
        {
            id: 3,
            series: "6969",
            description: "A lovely advnture of two lovers star crossed through time.",
            lootbox: 4,
            type: "manga",
            name: "Naruto 2: Electric Boogaloo",
            url: "https://myanimelist.net/manga/42/Dragon_Ball",
            image: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
        },
        {
            id: 4,
            series: "6969",
            description: "A lovely advnture of two lovers star crossed through time.",
            lootbox: 4,
            type: "manga",
            name: "Naruto 2: Electric Boogaloo",
            url: "https://myanimelist.net/manga/42/Dragon_Ball",
            image: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
        },
        {
            id: 5,
            series: "6969",
            description: "A lovely advnture of two lovers star crossed through time.",
            lootbox: 4,
            type: "manga",
            name: "Naruto 2: Electric Boogaloo",
            url: "https://myanimelist.net/manga/42/Dragon_Ball",
            image: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
        }
    ]
}

function makeMaliciousDrop() {
    const maliciousDrop = {
        id: 5,
        series: "6969",
        description: 'Naughty naughty very naughty <script>alert("xss");</script>',
        lootbox: 4,
        type: "manga",
        name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        url: "https://myanimelist.net/manga/42/Dragon_Ball",
        image: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
    }
    const expectedDrop = {
        ...maliciousDrop,
        description: 'Naughty naughty very naughty <script>alert("xss");</script>',
        name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }
    return {
        maliciousDrop,
        expectedDrop
    }
}
module.exports = {
    makeDropsArray,
    makeMaliciousDrop,
}