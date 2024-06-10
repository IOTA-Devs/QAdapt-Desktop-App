import {useEffect} from 'react';
import PageTitle from "@/components/custom/page-title";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import Prism from "prismjs";
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-python'
import "prismjs/themes/prism-okaidia.css"


export default function Help() {
    useEffect(() => {
        Prism.highlightAll()
    }, [])
    return (
        <>
            <PageTitle tabTitle="QAdapt | Help" />
            <h2 className="text-3xl py-5 font-bold">Help</h2>
            <div className="flex container flex-row justify-between w-full px-0 mx-0">
                <div className="flex flex-col w-8/12 mx-0 mr-10">
                    {/* cambiar estos styles no me gusta que sea igual que el h2 grande */}
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">introduction</h2>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">QAdapt introduction</h2>
                    <div>
                        <p>QAdapt is a self-healing framework, using a webdriver it allows you to find elements in a website for testing purposes and 
                            using our library, saves the elements that were successful and their attributes and everything that makes them an html elmeent in a local database
                            if it's a success everything works like it would using selenium's webdriver, but if it isn't our AI model runs a match against the previous element run
                            that was a success and uses the element returned by finding it on the page with this information in your tests allowing you to still have successful tests
                            even if locators have been changed.
                        </p>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Why use a self-healing framework</h2>
                    <div>
                        <p>A self-healing framework allows your quality assurance developpers to focus on failing tests that matter, if a locator is missing in our self-healing framework
                            the important tests still run, and everything still runs as expected so a lot of debugging time is cut down for the engineer since using selenium by itself there would be
                            some debugging a QA engineer would have to go through to find a locator error.
                        </p>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Getting Started with QAdapt</h2>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Account setup</h2>
                    <div>
                        <p>In order to setup your account, you must first log into our Desktop App or website, the way we link your account to an isntance of a webdriver running in your codebase
                            is via personal access tokens, these tokens should be used as a paremeter to our webdriver object's setup method on initial setup, after this initial setup all the functionality
                            of using the python library and the website should be available, we get into the python setup and where to find your personal access token further in the help guide.
                        </p>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Python Setup</h2>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">installing the python library</h2>
                    <div>
                        <p>Our python library is registered in PyPi, which means all you need to do is run the following command to have our library installed in your python environment. </p>
                    </div>
                    <div className="mr-10">
                        <pre>
                            <code className="language-python">
                                from qadapt import customDriver
                            </code>
                        </pre>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">QAdapt webdriver</h2>
                    <div>
                        <p>Our webdriver is the way your python tests will interact with our library so it will be necessary for you to initialize it using the same parameters you would use
                            for a chromeWebDriver since we inherit from that class, you would initialize our object liek this
                        </p>
                    </div>
                    <div className="mr-10">
                        <pre>
                            <code className="language-python">
                                driver = customDriver(service=Service(executable_path="./chromedriver"))
                            </code>
                        </pre>
                    </div>
                    <div>
                        <p>In this example, we use the service argument but all that is necessary is to initialize it like a chromeWebDriver, this could also be done with a web driver provider.</p>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Webdriver Methods</h2>
                    <div>
                        <p>Our webdriver has the same methods that a selenium webdriver has as can be seen here: selenium_docs, but it also includes a custom method we use in order to locate elements called find_element_custom, this method automatically does a WebDriverWait() 
                            in order to make sure the element you're looking for is loaded in the page, and has all of our self-healing functionality being a drop-in replacement to selenium's find_element method, this is how you would use it with our driver variable declared above.
                        </p>
                    </div>
                    <div className='mr-10'>
                        <pre>
                            <code className="language-python">
                                username_input = driver.find_element_custom(By.NAME, 'email')
                            </code>
                        </pre>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Example script</h2>
                    <div>
                        <p>Here is a test we designed for this very qadapt website using our python library, this code can be used as a reference of hwo to ustilize this
                            library, it is noteworthy to mention it's important to close the webdriver session at some point in your code since a lot of the code in our self-healing module
                            depends on the webdriver being closed.
                        </p>
                    </div>
                    <div className="overflow-hidden mr-10">
                        <pre className="whitespace-pre-wrap">
                            <code className="language-python whitespace-pre-wrap">{`import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import time
from qadapt import customDriver

class LoginTest(unittest.TestCase):
    def setUp(self):
        self.driver = customDriver(service=Service(executable_path="./chromedriver"))
        #setup method, takes in test, script, collection, personal_access_token
        self.driver.setup('testing new functions', 'script1', 'collection2', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyMCwidG9rZW5fbmFtZSI6IlRva2VuIiwidHlwZSI6InBlcnNvbmFsX2FjY2Vzc190b2tlbiIsImV4cCI6MTcyMjQwNTYwMH0.uJU7ljSAeiyBqQWQklSeKVtBz_ehLUei-EpWzxWQ5ig')

    def test_login(self):
        driver = self.driver
        url = "http://localhost:1420/login"
        driver.get(url)

        username_input = driver.find_element_custom(By.NAME, 'email')

        password_input = driver.find_element_custom(By.CSS_SELECTOR, "input[type='password']")

        login_button = driver.find_element_custom(By.CSS_SELECTOR, "button[type='submit']")

        username_input.send_keys("example@gmail.com")
        password_input.send_keys("password123")
        login_button.click()

        try:
            success_element = driver.find_element_custom(By.CSS_SELECTOR, "a[href='/home']")
            presence = True
        except:
            presence = False
        
        self.assertTrue(presence)

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()`}
                            </code>
                        </pre>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">QAdapt website</h2>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Overview</h2>
                    <div>
                        <p>This website is meant to give you an overview of the different tests you've run using the qadapt python library, we have a couple of ways we organize the data sent from the library which is by using collections which are a list of scripts, scripts are meant to be
                            an actual testing script a quality assurance engineer uses, and tests are meant to be the individual tests of that script, an individual find_element method being run, and selfHealingReports are each individual run of that find_element instance, whether or not self-healing was
                            performed, and whether or not it was successful or not, this information is then provided on the website for an engineer to see and make the proper changes to the test without needing to figure out what's wrong on their own, additionally in order to use the library you need to obtain a
                            personal access token from this website, we'll cover obtaining a personal access token more in detail in a later section.
                        </p>
                    </div>

                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Dashboard</h2>
                    <div>
                        <p>The dashboard section of the website shows a summary of all the tests that have been run and a menu for seeing your most recent tests, it also contains other important information and a graph showing the tests you have run.</p>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Collections</h2>
                    <div>
                        <p>Collections are simply a list of different scripts, each script is meant to represent an actual test script a QA engineer has, uses and has previously run, here you can create a new collection and view all the collections you currently have including a timestamp for the last date an item in the collection was modified.</p>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Scripts</h2>
                    <div>
                        <p>scripts are individual items of a collection, they're meant to be an individual python script, they contain different test runs and you can view them by clicking on one of them in the collections tab of the website.</p>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Tests</h2>
                    <div>
                        <p>A test is a series of Self-HealingReports being done, meaning a series of find_element instances being performed on html elements, you can find these by clicking on an individual Script in the scripts tab where you will see a list of tests and whether or not each test was a success or not  and when they were finished. </p>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Reports</h2>
                    <div>
                        <p>A report is an individual run of a test, if you run a find_element in our library, the result of that run will be seen as a Report, whethereor not self-healing was necessary, whether or not it was a success or not and the screenshot of what the website looked like at that point in time are all important data points shown by our library, you can find these by clicking on an individual test in the tests page.</p>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Profile</h2>
                    <div>
                        <p>The profile page is the first page that's a bit harder to find, you need to click on the three dots next to your profile icon and name, and a pop-up menu will appear, you then  click the Profile icon and you're there  here you can change up your profile picture, username and Full name, your email is unchangeable at this time but you can also change your password and manage your personal access tokens in this part of the website.</p>
                    </div>
                    <h2 className="text-3xl py-5 font-bold mx-0 w-full">Personal access tokens</h2>
                    <div>
                        <p>You can find personal access tokens in the Profile page, under the personal access tokens tab, here you will be able to create and delete personal access tokens, in order to use the library, create a perosnal access token and copy it somewhere secure like an environment variable, save it and use it to initialize the customDriver object like mentioned above in the Python setup section.</p>
                    </div>


                </div>
                <div className="flex w-5/12">
                    <Card className="w-full h-min">
                        <CardHeader>
                            <CardTitle>Table of contents</CardTitle>
                            <CardDescription>Quickly navigate help</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Introduction</AccordionTrigger>
                                    <AccordionContent>
                                        <div>qadapt introduction</div>
                                        <div>why use a self-healing framework</div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Getting Started</AccordionTrigger>
                                    <AccordionContent>
                                        <div>Account Setup</div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>Python setup</AccordionTrigger>
                                    <AccordionContent>
                                        <div>pip installation</div>
                                        <div>qadapt object webDriver</div>
                                        <div>webdriver methods</div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>Website help</AccordionTrigger>
                                    <AccordionContent>
                                        <div>overview</div>
                                        <div>collections</div>
                                        <div>scripts</div>
                                        <div>tests</div>
                                        <div>reports</div>
                                        <div>profile</div>
                                        <div>personal access tokens</div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}