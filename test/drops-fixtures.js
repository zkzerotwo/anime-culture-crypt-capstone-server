function makeDropsArray() {
    return [
        {
            id: 1,
            mal_id: "6969",
            drop_description: "A lovely advnture of two lovers star crossed through time.",
            lootbox_id: 4,
            drop_type: "manga",
            drop_name: "Naruto 2: Electric Boogaloo",
            url: "https://myanimelist.net/manga/42/Dragon_Ball",
            image_url: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
        },
        {
            id: 2,
            mal_id: "6969",
            drop_description: "A lovely advnture of two lovers star crossed through time.",
            lootbox_id: 4,
            drop_type: "manga",
            drop_name: "Naruto 2: Electric Boogaloo",
            url: "https://myanimelist.net/manga/42/Dragon_Ball",
            image_url: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
        },
        {
            id: 3,
            mal_id: "6969",
            drop_description: "A lovely advnture of two lovers star crossed through time.",
            lootbox_id: 4,
            drop_type: "manga",
            drop_name: "Naruto 2: Electric Boogaloo",
            url: "https://myanimelist.net/manga/42/Dragon_Ball",
            image_url: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
        },
        {
            id: 4,
            mal_id: "6969",
            drop_description: "A lovely advnture of two lovers star crossed through time.",
            lootbox_id: 4,
            drop_type: "manga",
            drop_name: "Naruto 2: Electric Boogaloo",
            url: "https://myanimelist.net/manga/42/Dragon_Ball",
            image_url: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
        },
        {
            id: 5,
            mal_id: "6969",
            drop_description: "A lovely advnture of two lovers star crossed through time.",
            lootbox_id: 4,
            drop_type: "manga",
            drop_name: "Naruto 2: Electric Boogaloo",
            url: "https://myanimelist.net/manga/42/Dragon_Ball",
            image_url: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
        }
    ]
}

function makeMaliciousDrop() {
    const maliciousDrop = {
        id: 5,
        mal_id: "6969",
        drop_description: 'Naughty naughty very naughty <script>alert("xss");</script>',
        lootbox_id: 4,
        drop_type: "manga",
        drop_name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        url: "https://myanimelist.net/manga/42/Dragon_Ball",
        image_url: "https://cdn.myanimelist.net/images/manga/2/54545.jpg"
    }
    const expectedDrop = {
        ...maliciousDrop,
        drop_description: 'Naughty naughty very naughty <script>alert("xss");</script>',
        drop_drop_name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
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