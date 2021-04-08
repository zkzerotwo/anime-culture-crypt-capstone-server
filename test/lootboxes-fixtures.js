function makeLootboxesArray() {
    return [
        {
            id: 1,
            title: "Shojo Classics",
            description: "Soft titles with a romantic plotline, beautiful characters, and a dramatic climax",
            is_public: 0,
            box_owner: 1
        },
        {
            id: 2,
            title: "Shojo Classics",
            description: "Soft titles with a romantic plotline, beautiful characters, and a dramatic climax",
            is_public: 0,
            box_owner: 1
        },
        {
            id: 3,
            title: "Shojo Classics",
            description: "Soft titles with a romantic plotline, beautiful characters, and a dramatic climax",
            is_public: 0,
            box_owner: 1
        },
        {
            id: 5,
            title: "Shojo Classics",
            description: "Soft titles with a romantic plotline, beautiful characters, and a dramatic climax",
            is_public: 0,
            box_owner: 1
        },
        {
            id: 6,
            title: "Shojo Classics",
            description: "Soft titles with a romantic plotline, beautiful characters, and a dramatic climax",
            is_public: 0,
            box_owner: 1
        }
    ]
}

function makeMaliciousLootbox() {
    const maliciousLootbox = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        box_owner: 6
    }
    const expectedLootbox = {
        ...maliciousLootbox,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
        maliciousLootbox,
        expectedLootbox
    }
}

module.exports = {
    makeLootboxesArray,
    makeMaliciousLootbox
}