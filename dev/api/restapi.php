<?php

header("Content-Type: application/json");

define("WWW_ROOT",dirname(dirname(__FILE__)).DIRECTORY_SEPARATOR);

require_once WWW_ROOT. "api" .DIRECTORY_SEPARATOR. 'Slim'. DIRECTORY_SEPARATOR .'Slim.php';
/*require_once WWW_ROOT. "dao" .DIRECTORY_SEPARATOR. 'PollsDAO.php';
require_once WWW_ROOT. "dao" .DIRECTORY_SEPARATOR. 'QuestionsDAO.php';
require_once WWW_ROOT. "dao" .DIRECTORY_SEPARATOR. 'FilledInAnswersDAO.php';*/


$app = new Slim();

/*$app->post('/filledinanswers', 'insertFilledInAnswer');

$app->get('/polls/:id', 'getPoll');
$app->get('/polls','getPolls');

$app->get('/questions/:id', 'getQuestion');

$app->run();

function insertFilledInAnswer()
{
    $post = (array) json_decode(Slim::getInstance()->request()->getBody());
    $filledInAnswersDAO = new FilledInAnswersDAO();
    echo json_encode($filledInAnswersDAO->insertFilledInAnswer($post['question_id'],$post['answer_id']));
    exit();
}

function getPoll($id)
{
    $pollsDAO = new PollsDAO();
    echo json_encode($pollsDAO->getPoll($id));
    exit();
}

function getPolls()
{
    $pollsDAO = new PollsDAO();
    echo json_encode($pollsDAO->getPolls());
    exit();
}


function getQuestion($id){
    $questionsDAO = new QuestionsDAO();
    echo json_encode($questionsDAO->getQuestion($id));
    exit();
}

function addQuestion($poll_id){
    $post = Slim::getInstance()->request()->post();
    echo json_encode($post);
    exit();
}