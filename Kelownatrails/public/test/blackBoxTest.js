const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function blackBoxTesting() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        // Navigate to the application's URL
        await driver.get('http://localhost:3000'); // Replace with actual URL

        // Test 1: Check adding a group member with valid data
        await driver.findElement(By.id("firstname")).sendKeys("John");
        await driver.findElement(By.id("lastname")).sendKeys("Doe");
        await driver.findElement(By.id("GroupSize")).sendKeys("8");
        await driver.findElement(By.id("addMemberBtn")).click();

        // Check if the member was added to the list
        let memberList = await driver.findElement(By.id("members"));
        let options = await memberList.findElements(By.tagName("option"));
        let isAdded = false;

        for (let option of options) {
            let text = await option.getText();
            if (text === "Doe, John") {
                isAdded = true;
                break;
            }
        }

        console.assert(isAdded, "Test 1 Failed: Group member was not added correctly");

        // Test 2: Check for empty first or last name validation
        await driver.findElement(By.id("firstname")).clear();
        await driver.findElement(By.id("lastname")).clear();
        await driver.findElement(By.id("GroupSize")).clear();
        await driver.findElement(By.id("addMemberBtn")).click();

        let alert = await driver.switchTo().alert();
        let alertText = await alert.getText();
        await alert.accept();

        console.assert(alertText === "Please first enter a group member's name", "Test 2 Failed: Alert message incorrect for empty names");

        // Test 3: Check for non-numeric group size validation
        await driver.findElement(By.id("firstname")).sendKeys("Jane");
        await driver.findElement(By.id("lastname")).sendKeys("Smith");
        await driver.findElement(By.id("GroupSize")).sendKeys("not_a_number");
        await driver.findElement(By.id("addMemberBtn")).click();

        alert = await driver.switchTo().alert();
        alertText = await alert.getText();
        await alert.accept();

        console.assert(alertText.includes("It's not a number"), "Test 3 Failed: Alert message incorrect for non-numeric group size");

        // Test 4: Check group discount calculation
        await driver.findElement(By.id("GroupSize")).clear();
        await driver.findElement(By.id("GroupSize")).sendKeys("15"); // Discount Group 2
        await driver.findElement(By.id("addMemberBtn")).click();

        let discRate = await driver.findElement(By.id("discRate")).getAttribute("value");
        console.assert(discRate === "40.00", `Test 4 Failed: Expected discount rate of 40.00, but got ${discRate}`);

        // Test 5: Check Sort Members functionality
        await driver.findElement(By.id("sortMemberListBtn")).click();

        // Verify if list is sorted (ascending order)
        let sortedNames = ["Doe, John", "Smith, Jane"];
        options = await memberList.findElements(By.tagName("option"));
        let isSorted = true;

        for (let i = 0; i < sortedNames.length; i++) {
            let text = await options[i].getText();
            if (text !== sortedNames[i]) {
                isSorted = false;
                break;
            }
        }

        console.assert(isSorted, "Test 5 Failed: Members were not sorted correctly");

        // Test 6: Check delete functionality and error message for unimplemented function
        await driver.findElement(By.id("deleteMemberBtn")).click();

        alert = await driver.switchTo().alert();
        alertText = await alert.getText();
        await alert.accept();

        console.assert(alertText === "ERROR! You must work in this function before to send to Staging Environment!", "Test 6 Failed: Error message not shown correctly for delete member");

    } finally {
        await driver.quit();
    }
})();