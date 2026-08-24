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

let questions = [];

let ratings = [];


/* =========================
   API
========================= */


async function getData() {

    const response =
        await fetch(API_URL);

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


    if (page === 2) {

        loadRatings();

    }


    if (page === 3) {

        loadResults();

    }

}


/* =========================
   PAGE 1
========================= */


async function saveQuestions() {

    currentStudent =
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


    if (!currentStudent) {

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


    const existing =
        await getQuestions();


    if (
        existing.some(
            row =>
                row.student ===
                currentStudent
        )
    ) {

        alert(
            "This student has already submitted questions."
        );

        return;

    }


    await sendData({

        type:
            "questions",

        student:
            currentStudent,

        questions:
            [
                q1,
                q2,
                q3
            ]

    });


    alert(
        "Your questions have been saved."
    );


    showPage(2);

}


/* =========================
   GET QUESTIONS
========================= */


async function getQuestions() {

    try {

        const data =
            await getData();

        return data.questions || [];

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not connect to the database."
        );

        return [];

    }

}


/* =========================
   PAGE 2
========================= */


async function loadRatings() {

    const container =
        document.getElementById(
            "ratingContainer"
        );


    container.innerHTML =
        "<p>Loading questions...</p>";


    const allQuestions =
        await getQuestions();


    const others =
        allQuestions.filter(
            row =>
                row.student !==
                currentStudent
        );


    if (others.length < 4) {

        container.innerHTML = `

            <p>
                Not all students have
                submitted their questions yet.
            </p>

            <p>
                ${others.length}
                of 4 other students
                have submitted.
            </p>

        `;

        return;

    }


    /*
       Randomize students
    */


    const randomized =
        shuffle(others);


    container.innerHTML = "";


    randomized.forEach(
        (student, studentIndex) => {


            const block =
                document.createElement(
                    "div"
                );


            block.className =
                "anonymousBlock";


            block.dataset.student =
                student.student;


            block.innerHTML = `

                <div class="anonymousTitle">

                    Student
                    ${String.fromCharCode(
                        65 + studentIndex
                    )}

                </div>

            `;


            student.questions
                .forEach(
                    (question, questionIndex) => {


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
                                            s${studentIndex}
                                            q${questionIndex}
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


    if (blocks.length !== 4) {

        alert(
            "There are not yet four other students."
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


        for (
            let q = 0;
            q < 3;
            q++
        ) {


            const selected =
                document.querySelector(
                    `input[name="s${i}q${q}"]:checked`
                );


            if (!selected) {

                alert(
                    "Please rate every question."
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


    await sendData({

        type:
            "ratings",

        ratings:
            newRatings

    });


    alert(
        "Your ratings have been submitted."
    );


    showPage(3);

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


    const data =
        await getData();


    const questionData =
        data.questions || [];


    const ratingData =
        data.ratings || [];


    const results = [];


    questionData.forEach(
        student => {


            student.questions
                .forEach(
                    (question, index) => {


                        const score =
                            ratingData

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
       Highest → lowest
    */


    results.sort(
        (a, b) =>
            b.score -
            a.score
    );


    let html = `

        <table>

            <tr>

                <th>Rank</th>

                <th>Student</th>

                <th>Research Question</th>

                <th>Points</th>

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


    html += "</table>";


    container.innerHTML =
        html;

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


    await sendData({

        type:
            "reset"

    });


    alert(
        "All results have been reset."
    );


    location.reload();

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
