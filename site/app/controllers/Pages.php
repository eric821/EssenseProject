<?php

include_once MODELS . "Page.php";

class Pages extends Controller
{
    private Page $pg;

    public function __construct()
    {
        $this->pg = new Page();
    }

    public function LoginSubmit(): void
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $user = htmlspecialchars($_POST['user']);
            $pass = htmlspecialchars($_POST["pass"]);

            $response = $this->pg->CheckLoginInfo($user, $pass);

            if($response != 0)
            {
                session_start();
                $_SESSION["user"] = $response;
                echo json_encode("1");
            }
            else
            {
                echo json_encode($response);
            }
        }
    }

    public function Logout(): void
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            if($_SESSION["user"] != "")
            {
                session_destroy();
                echo json_encode("ok");
            }
        }
    }

    public function CheckLoginStatus(): void
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $isLoggedIn = new stdClass();
            $isLoggedIn->loggedIn = false;
            if(isset($_SESSION["user"]) && $_SESSION["user"] != "")
            {
                $isLoggedIn->loggedIn = true;
                echo json_encode($isLoggedIn);
            }
        }
    }

    public function CheckLastUserVote(): void
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $userId = $_SESSION["user"];
            $lastVoteDate = $this->pg->SelectLastVoteDate($userId);

        }
    }

    public function CheckUserVote(): bool
    {
        $userId = $_SESSION["user"];
        $lastVoteDate = $this->pg->SelectLastVoteDate($userId);

        if($lastVoteDate < date("Y-m-d") || $lastVoteDate == false)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    public function AddGame() :void
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            if($this->CheckUserVote() == false)
            {
                echo json_encode("1");
            }
            else
            {
                $gameName = htmlspecialchars($_POST["gameName"]);
                $isNewGame = $this->pg->CheckIfNewGame($gameName);

                if($isNewGame == false)
                {
                    echo json_encode("2");
                }
                else
                {
                    $gameId = $this->pg->AddNewGame($_SESSION["user"], $gameName);
                    $this->pg->AddNewVote($_SESSION["user"], 0, $gameId);
                    echo json_encode("0");
                }
            }
        }
    }

    public function VoteGame() :void
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            if($this->CheckUserVote() == false)
            {
                echo json_encode("1");
            }
            else
            {
                $this->pg->AddNewVote($_SESSION["user"], 1, htmlspecialchars($_POST["gameId"]));
                echo json_encode("0");
            }
        }
    }

    public function RecallVote() :void
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $getLastUserVote = $this->pg->SelectLastUserVote($_SESSION["user"]);
            $this->pg->DeactivateVote($getLastUserVote->User_Vote_ID);
            echo json_encode($getLastUserVote->Game_ID, JSON_NUMERIC_CHECK);
        }
    }

    public function HasUserVotedToday() :void
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            if($this->CheckUserVote() == false)
            {
                echo json_encode("1");
            }
            else
            {
                echo json_encode("0");
            }
        }
    }

    public function RemoveGame() :void
    {
        if($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $this->pg->DeactivateGame(htmlspecialchars($_POST["gameId"]));
            echo json_encode("ok");
        }
    }

    public function index(): void
    {
        $this->view("pages/index");
    }
}