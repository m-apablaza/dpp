const API_URL =
    "https://script.google.com/macros/s/AKfycbwV55svTJlvJwCr3KRm2P_RknjZRvSg_85B95MeEGrZhBxf7YGL8ylvEByVzzI0Z2XD/exec";


const students = [

    "Catalina Garín",
    "Camila Sandoval",
    "Yamil Tala",
    "Trinidad Valdés",
    "Isabel Véliz"

];


let currentStudent = "";

let selectedQuestions = [];



/* =====================================================
   API
===================================================== */


async function getData() {

    const response =
        await fetch(API_URL);

    if (!response.ok) {

        throw new Error(
            "Connection error"
        );

    }

    return await response.json();

}



async function sendData(data) {

    const response =
        await fetch(

            API_URL,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify(data)

            }

        );


    if (!response.ok) {

        throw new Error(
            "Connection error"
        );

    }


    return await response.json();

}



/* =====================================================
   NAVIGATION
===================================================== */


function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(
            pageElement => {

                pageElement.classList.remove(
                    "active"
                );

            }
        );


    document
        .getElementById(
            "page" + page
        )
        .classList.add(
            "active"
        );

}



/* =====================================================
   PAGE 1 — IDENTIFICATION + QUESTIONS
===================================================== */


async function saveQuestions() {

    const name =
        document
            .getElementById(
                "studentSelect"
            )
            .value;


    const q1 =
        document
            .getElementById(
                "q1"
            )
            .value
            .trim();


    const q2 =
        document
            .getElementById(
                "q2"
            )
            .value
            .trim();


    const q3 =
        document
            .getElementById(
                "q3"
            )
            .value
            .trim();



    /* -------------------------
       Validation
    ------------------------- */


    if (!name) {

        alert(
            "Please select your name."
        );

        return;

    }


    if (
        !q1 ||
        !q2 ||
        !q3
    ) {

        alert(
            "Please complete all three research questions."
        );

        return;

    }



    try {

        /*
           Check Google Sheets first.
        */

        const data =
            await getData();



        /*
           Check whether this student
           already submitted questions.
        */

        const alreadySubmitted =
            data.questions.some(

                row =>
                    row.student === name

            );



        if (alreadySubmitted) {

            currentStudent =
                name;


            showAlreadySubmitted();


            return;

        }



        /*
           Save questions.
        */

        await sendData({

            type:
                "questions",

            student:
                name,

            questions: [

                q1,
                q2,
                q3

            ]

        });



        currentStudent =
            name;


        showAlreadySubmitted();



    }

    catch (error) {

        console.error(
            error
        );


        alert(
            "Could not connect to the server. Please try again."
        );

    }

}



/* =====================================================
   STUDENT ALREADY SUBMITTED
===================================================== */


function showAlreadySubmitted() {

    /*
       Hide the original form.
    */

    document
        .getElementById(
            "studentForm"
        )
        .style.display =
            "none";



    /*
       Show confirmation.
    */

    const message =
        document.getElementById(
            "submittedMessage"
        );


    message.style.display =
        "block";


    message.innerHTML = `

        <strong>
            Your research questions
            have been submitted.
        </strong>

        <p>
            Your questions cannot be edited.
        </p>

    `;



    /*
       Show Continue button.
    */

    document
        .getElementById(
            "continueButton"
        )
        .style.display =
            "inline-block";

}



/* =====================================================
   CONTINUE TO EVALUATION
===================================================== */


async function continueToEvaluation() {

    showPage(2);

    await checkQuestions();

}



/* =====================================================
   PAGE 2 — WAIT FOR ALL STUDENTS
===================================================== */


async function checkQuestions() {

    const waiting =
        document.getElementById(
            "waiting"
        );


    const container =
        document.getElementById(
            "selectionContainer"
        );


    const submitButton =
        document.getElementById(
            "submitSelectionButton"
        );



    /*
       Reset interface.
    */

    waiting.style.display =
        "block";


    container.style.display =
        "none";


    submitButton.style.display =
        "none";


    selectedQuestions =
        [];


    updateCounter();



    try {

        const data =
            await getData();



        /*
           If fewer than five students
           have submitted, keep waiting.
        */

        if (
            data.questions.length <
            students.length
        ) {

            waiting.innerHTML = `

                <strong>
                    Waiting for all students
                    to submit their research questions...
                </strong>

                <p>

                    ${data.questions.length}
                    of
                    ${students.length}
                    students have submitted.

                </p>

                <p>

                    When everyone has finished,
                    click

                    <strong>
                        Check for Questions
                    </strong>.

                </p>

            `;


            return;

        }



        /*
           All five students have submitted.
        */

        waiting.style.display =
            "none";


        loadSelectionQuestions(
            data.questions
        );


        container.style.display =
            "block";


        updateCounter();



    }

    catch (error) {

        console.error(
            error
        );


        waiting.innerHTML = `

            <strong>
                Connection lost.
            </strong>

            <p>

                Please check your internet
                connection and try again.

            </p>

        `;

    }

}



/* =====================================================
   LOAD ANONYMOUS QUESTIONS
===================================================== */


function loadSelectionQuestions(
    allQuestions
) {

    const container =
        document.getElementById(
            "selectionContainer"
        );


    container.innerHTML =
        "";



    /*
       Remove the current student's
       questions.
    */

    const others =
        allQuestions.filter(

            row =>
                row.student !==
                currentStudent

        );



    /*
       Put all questions from the
       other four students into
       one single anonymous pool.
    */

    const allOtherQuestions =
        [];



    others.forEach(
        student => {

            student.questions.forEach(
                (
                    question,
                    index
                ) => {

                    allOtherQuestions.push({

                        target:
                            student.student,

                        questionNumber:
                            index + 1,

                        text:
                            question

                    });

                }
            );

        }
    );



    /*
       Randomize the 12 questions.
    */

    const randomized =
        shuffle(
            allOtherQuestions
        );



    /*
       Create one clickable card
       for each question.
    */

    randomized.forEach(
        item => {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "question-card";


            label.dataset.target =
                item.target;


            label.dataset.questionNumber =
                item.questionNumber;



            label.innerHTML = `

                <input
                    type="checkbox"
                >

                <span class="question-text">

                    ${escapeHtml(
                        item.text
                    )}

                </span>

            `;



            const checkbox =
                label.querySelector(
                    "input"
                );



            /*
               Selection behavior.
            */

            checkbox.addEventListener(
                "change",
                () => {


                    /* -------------------------
                       SELECT
                    ------------------------- */

                    if (
                        checkbox.checked
                    ) {


                        /*
                           Never allow more
                           than three.
                        */

                        if (
                            selectedQuestions.length >= 3
                        ) {

                            checkbox.checked =
                                false;

                            return;

                        }



                        selectedQuestions.push({

                            target:
                                item.target,

                            question:
                                item.questionNumber,

                            text:
                                item.text

                        });



                        label.classList.add(
                            "selected"
                        );

                    }



                    /* -------------------------
                       DESELECT
                    ------------------------- */

                    else {


                        selectedQuestions =
                            selectedQuestions.filter(

                                selected =>

                                    !(
                                        selected.target ===
                                        item.target

                                        &&

                                        selected.question ===
                                        item.questionNumber
                                    )

                            );


                        label.classList.remove(
                            "selected"
                        );

                    }



                    /*
                       Disable all remaining
                       questions after three
                       have been selected.
                    */

                    document
                        .querySelectorAll(
                            ".question-card input"
                        )
                        .forEach(
                            input => {

                                if (
                                    !input.checked
                                ) {

                                    input.disabled =
                                        selectedQuestions.length >= 3;

                                }

                            }
                        );



                    updateCounter();

                }
            );



            container.appendChild(
                label
            );

        }
    );

}



/* =====================================================
   SELECTION COUNTER
===================================================== */


function updateCounter() {

    const counter =
        document.getElementById(
            "selectionCounter"
        );


    const submitButton =
        document.getElementById(
            "submitSelectionButton"
        );



    /*
       Update counter.
    */

    counter.textContent =
        `${selectedQuestions.length} / 3 selected`;



    /*
       Exactly three selected:
       enable Submit.
    */

    if (
        selectedQuestions.length === 3
    ) {

        counter.textContent =
            "3 / 3 selected ✓";


        submitButton.style.display =
            "inline-block";

    }


    else {

        submitButton.style.display =
            "none";

    }

}



/* =====================================================
   SAVE THE THREE CHOICES
===================================================== */


async function saveSelection() {

    /*
       Final validation.
    */

    if (
        selectedQuestions.length !== 3
    ) {

        alert(
            "Please select exactly 3 research questions."
        );

        return;

    }



    try {


        /*
           Each selected question
           receives one vote.
        */

        await sendData({

            type:
                "ratings",

            ratings:

                selectedQuestions.map(
                    item => ({

                        rater:
                            currentStudent,

                        target:
                            item.target,

                        question:
                            item.question,

                        score:
                            1

                    })
                )

        });



        /*
           Replace Page 2 with
           confirmation.
        */

        const page =
            document.getElementById(
                "page2"
            );


        page.innerHTML = `

            <h2>
                Selection Submitted
            </h2>

            <p>

                Your three choices have been
                successfully submitted.

            </p>

            <button
                onclick="
                    showPage(3);
                    loadResults();
                "
            >

                Continue to Results

            </button>

        `;



    }

    catch (error) {

        console.error(
            error
        );


        alert(

            "Your selection could not be submitted. " +
            "Please check your internet connection " +
            "and try again."

        );

    }

}



/* =====================================================
   PAGE 3 — RESULTS
===================================================== */


async function loadResults() {

    const container =
        document.getElementById(
            "results"
        );


    container.innerHTML =
        "<p>Loading results...</p>";



    try {

        const data =
            await getData();



        const questions =
            data.questions || [];


        const ratings =
            data.ratings || [];



        const results =
            [];



        /*
           Calculate votes for every
           individual research question.
        */

        questions.forEach(
            student => {

                student.questions.forEach(
                    (
                        question,
                        index
                    ) => {


                        const votes =
                            ratings.filter(

                                r =>

                                    r.target ===
                                    student.student

                                    &&

                                    Number(
                                        r.question
                                    ) ===
                                    index + 1

                                    &&

                                    Number(
                                        r.score
                                    ) ===
                                    1

                            ).length;



                        results.push({

                            student:
                                student.student,

                            question:
                                question,

                            votes:
                                votes

                        });

                    }
                );

            }
        );



        /*
           Highest number of votes first.
        */

        results.sort(

            (a, b) => {

                if (
                    b.votes !==
                    a.votes
                ) {

                    return (
                        b.votes -
                        a.votes
                    );

                }


                /*
                   Alphabetical order
                   for ties.
                */

                return a.student.localeCompare(
                    b.student
                );

            }

        );



        /*
           Build question ranking.
        */

        let html = `

            <h3>
                Research Questions Ranking
            </h3>

            <table>

                <tr>

                    <th>
                        Rank
                    </th>

                    <th>
                        Student
                    </th>

                    <th>
                        Research Question
                    </th>

                    <th>
                        Votes
                    </th>

                </tr>

        `;



        results.forEach(
            (
                item,
                index
            ) => {

                html += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.student
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.question
                            )}
                        </td>

                        <td class="vote-count">

                            ${item.votes}

                        </td>

                    </tr>

                `;

            }
        );



        html += `

            </table>

        `;



        /*
           Calculate total votes
           received by each student.
        */

        const totals =
            {};



        results.forEach(
            item => {

                totals[item.student] =

                    (
                        totals[item.student] ||
                        0
                    )

                    +

                    item.votes;

            }
        );



        /*
           Sort students by total votes.
        */

        const studentRanking =

            Object
                .entries(
                    totals
                )

                .map(
                    (
                        [
                            student,
                            votes
                        ]
                    ) => ({

                        student:
                            student,

                        votes:
                            votes

                    })
                )

                .sort(
                    (a, b) => {

                        if (
                            b.votes !==
                            a.votes
                        ) {

                            return (
                                b.votes -
                                a.votes
                            );

                        }


                        return a.student.localeCompare(
                            b.student
                        );

                    }
                );



        /*
           Student ranking table.
        */

        html += `

            <h3>
                Student Ranking
            </h3>

            <table>

                <tr>

                    <th>
                        Rank
                    </th>

                    <th>
                        Student
                    </th>

                    <th>
                        Total Votes
                    </th>

                </tr>

        `;



        studentRanking.forEach(
            (
                item,
                index
            ) => {

                html += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.student
                            )}
                        </td>

                        <td class="vote-count">

                            ${item.votes}

                        </td>

                    </tr>

                `;

            }
        );



        html += `

            </table>

        `;



        container.innerHTML =
            html;



    }

    catch (error) {

        console.error(
            error
        );


        container.innerHTML = `

            <p>

                Could not load results.
                Please check your connection.

            </p>

        `;

    }

}



/* =====================================================
   RESET
===================================================== */


async function resetResults() {

    const confirmation =
        prompt(

            "Type RESET to delete all questions and results:"

        );



    if (
        confirmation !==
        "RESET"
    ) {

        return;

    }



    try {

        await sendData({

            type:
                "reset"

        });



        alert(
            "All results have been reset."
        );


        location.reload();



    }

    catch (error) {

        console.error(
            error
        );


        alert(
            "Could not reset the results."
        );

    }

}



/* =====================================================
   SHUFFLE
===================================================== */


function shuffle(array) {

    const result =
        [...array];



    for (
        let i =
            result.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] =

        [
            result[j],
            result[i]
        ];

    }



    return result;

}



/* =====================================================
   HTML SECURITY
===================================================== */


function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}
