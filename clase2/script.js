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



/* =========================
   API
========================= */


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



/* =========================
   NAVIGATION
========================= */


function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(
            p =>
                p.classList.remove(
                    "active"
                )
        );


    document
        .getElementById(
            "page" + page
        )
        .classList.add("active");

}



/* =========================
   PAGE 1
========================= */


async function saveQuestions() {

    const name =
        document
            .getElementById(
                "studentSelect"
            )
            .value;


    const q1 =
        document
            .getElementById("q1")
            .value.trim();


    const q2 =
        document
            .getElementById("q2")
            .value.trim();


    const q3 =
        document
            .getElementById("q3")
            .value.trim();


    if (!name) {

        alert(
            "Please select your name."
        );

        return;

    }


    if (!q1 || !q2 || !q3) {

        alert(
            "Please complete all three questions."
        );

        return;

    }


    try {

        const data =
            await getData();


        const alreadySubmitted =
            data.questions.some(
                row =>
                    row.student === name
            );


        if (alreadySubmitted) {

            currentStudent = name;

            showAlreadySubmitted();

            return;

        }


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


        currentStudent = name;


        showAlreadySubmitted();


    }

    catch (error) {

        alert(
            "Could not connect to the server. Please try again."
        );

    }

}



/* =========================
   ALREADY SUBMITTED
========================= */


function showAlreadySubmitted() {

    document
        .getElementById(
            "studentForm"
        )
        .style.display = "none";


    const message =
        document.getElementById(
            "submittedMessage"
        );


    message.style.display =
        "block";


    message.innerHTML = `

        <strong>
            Your research questions
            have already been submitted.
        </strong>

        <p>
            You cannot edit them.
        </p>

    `;


    document
        .getElementById(
            "continueButton"
        )
        .style.display =
            "inline-block";

}



/* =========================
   CONTINUE TO EVALUATION
========================= */


async function continueToEvaluation() {

    showPage(2);

    await checkQuestions();

}



/* =========================
   PAGE 2
========================= */


async function checkQuestions() {

    const waiting =
        document.getElementById(
            "waiting"
        );


    const container =
        document.getElementById(
            "ratingContainer"
        );


    waiting.style.display =
        "block";


    container.style.display =
        "none";


    document
        .getElementById(
            "submitRatingsButton"
        )
        .style.display =
            "none";


    try {

        const data =
            await getData();


        /*
           Do not show anything until
           all five students have
           submitted their questions.
        */


        if (
            data.questions.length <
            students.length
        ) {

            waiting.innerHTML = `

                <strong>
                    Waiting for all students
                    to submit their research
                    questions...
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
           All five have submitted.
        */


        waiting.style.display =
            "none";


        loadRatingQuestions(
            data.questions
        );


        container.style.display =
            "block";


        document
            .getElementById(
                "submitRatingsButton"
            )
            .style.display =
                "inline-block";


    }

    catch (error) {

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



/* =========================
   LOAD QUESTIONS
========================= */


function loadRatingQuestions(
    allQuestions
) {


    const container =
        document.getElementById(
            "ratingContainer"
        );


    container.innerHTML = "";


    /*
       Remove current student's questions.
    */


    const others =
        allQuestions.filter(
            row =>
                row.student !==
                currentStudent
        );


    /*
       Randomize the questions.
    */


    const randomized =
        shuffle(others);


    randomized.forEach(
        student => {


            /*
               No student name is displayed.
            */


            const block =
                document.createElement(
                    "div"
                );


            block.className =
                "anonymousBlock";


            block.dataset.student =
                student.student;


            student.questions
                .forEach(
                    (
                        question,
                        questionIndex
                    ) => {


                        const div =
                            document.createElement(
                                "div"
                            );


                        div.className =
                            "question";


                        let options = "";


                        for (
                            let i = 1;
                            i <= 7;
                            i++
                        ) {

                            options += `

                                <label>

                                    <input
                                        type="radio"

                                        name="
                                            student_${student.student}
                                            _q${questionIndex}
                                        "

                                        value="${i}"
                                    >

                                    ${i}

                                </label>

                            `;

                        }


                        div.innerHTML = `

                            <p>
                                ${question}
                            </p>

                            <div class="rating">

                                ${options}

                            </div>

                        `;


                        block.appendChild(
                            div
                        );

                    }
                );


            container.appendChild(
                block
            );

        }
    );

}



/* =========================
   SAVE RATINGS
========================= */


async function saveRatings() {

    const blocks =
        document.querySelectorAll(
            ".anonymousBlock"
        );


    if (
        blocks.length !== 4
    ) {

        alert(
            "There are not enough questions yet."
        );

        return;

    }


    const newRatings = [];


    for (
        let i = 0;
        i < blocks.length;
        i++
    ) {


        const target =
            blocks[i].dataset.student;


        const questions =
            blocks[i]
                .querySelectorAll(
                    ".question"
                );


        for (
            let q = 0;
            q < questions.length;
            q++
        ) {


            const selected =
                questions[q]
                    .querySelector(
                        "input:checked"
                    );


            if (!selected) {

                alert(
                    "Please rate every research question."
                );

                return;

            }


            newRatings.push({

                rater:
                    currentStudent,

                target:
                    target,

                question:
                    q + 1,

                score:
                    Number(
                        selected.value
                    )

            });

        }

    }


    try {

        await sendData({

            type:
                "ratings",

            ratings:
                newRatings

        });


        /*
           Instead of automatically
           loading results, show a
           button to continue.
        */


        const page =
            document.getElementById(
                "page2"
            );


        page.innerHTML = `

            <h2>
                Evaluation Submitted
            </h2>

            <p>
                Your ratings have been
                successfully submitted.
            </p>

            <button
                onclick="showPage(3); loadResults();">

                Continue to Results

            </button>

        `;


    }

    catch (error) {

        alert(
            "Your evaluation could not be submitted. Please check your internet connection and try again."
        );

    }

}



/* =========================
   RESULTS
========================= */


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


        const results = [];


        questions.forEach(
            student => {


                student.questions
                    .forEach(
                        (
                            question,
                            index
                        ) => {


                            const score =
                                ratings

                                    .filter(
                                        r =>
                                            r.target ===
                                            student.student &&

                                            Number(
                                                r.question
                                            ) ===
                                            index + 1
                                    )

                                    .reduce(
                                        (
                                            sum,
                                            r
                                        ) =>
                                            sum +
                                            Number(
                                                r.score
                                            ),

                                        0
                                    );


                            results.push({

                                student:
                                    student.student,

                                question:
                                    question,

                                score:
                                    score

                            });

                        }
                    );

            }
        );


        /*
           Highest score first.
        */


        results.sort(
            (a, b) =>
                b.score -
                a.score
        );


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
                        Points
                    </th>

                </tr>

        `;


        results.forEach(
            (item, index) => {

                html += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${item.student}
                        </td>

                        <td>
                            ${item.question}
                        </td>

                        <td>
                            <strong>
                                ${item.score}
                            </strong>
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

        container.innerHTML = `

            <p>
                Could not load results.
                Please check your connection.
            </p>

        `;

    }

}



/* =========================
   RESET
========================= */


async function resetResults() {

    const confirmation =
        prompt(
            "Type RESET to delete all results:"
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

        alert(
            "Could not reset the results."
        );

    }

}



/* =========================
   SHUFFLE
========================= */


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
