<?php

class Page
{
    private  $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    public function CheckLoginInfo(string $user, string $pass): int
    {
        $this->db->query("SELECT User_ID, User_Password FROM Users WHERE User_Name = :usr AND User_Active = 1");
        $this->db->bind(":usr", $user);
        $row = $this->db->single();
        if($row)
        {
            if(password_verify($pass, $row->User_Password))
            {
                return $row->User_ID;
            }
            else
            {
                return 0;
            }
        }
        else
        {
            return 0;
        }
    }

    public function SelectLastVoteDate(int $userId): string|null
    {
        $this->db->query("SELECT DATE_FORMAT(Vote_Timestamp, '%Y-%m-%d') AS Vote_Timestamp FROM User_Votes WHERE User_ID = :uid AND Is_Active = 1 ORDER BY User_Vote_ID DESC LIMIT 1");
        $this->db->bind(":uid", $userId);
        return $this->db->single()->Vote_Timestamp;
    }

    public function CheckIfNewGame(string $gameName) :bool
    {
        $this->db->query("SELECT Game_ID FROM Games WHERE Game_Name LIKE :gn AND Is_Active = 1");
        $this->db->bind(":gn", '%' . $gameName . '%');
        $row = $this->db->single();
        if($row)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    public function AddNewGame(int $userId, string $gameName): int
    {
        $this->db->query("INSERT INTO Games (User_ID, Game_Name) VALUES (:uid, :gn)");
        $this->db->bind(":uid", $userId);
        $this->db->bind(":gn", $gameName);
        $this->db->execute();

        $this->db->query("SELECT Game_ID FROM Games ORDER BY Game_ID DESC LIMIT 1");
        return $this->db->single()->Game_ID;
    }

    public function AddNewVote(int $userId, int $voteType, int $gameId): void
    {
        $this->db->query("INSERT INTO User_Votes (User_ID, Real_Vote, Game_ID) VALUES (:uid, :vt, :gid)");
        $this->db->bind(":uid", $userId);
        $this->db->bind(":vt", $voteType);
        $this->db->bind(":gid", $gameId);
        $this->db->execute();
    }

    public function SelectLastUserVote(int $userId) :object
    {
        $this->db->query("SELECT User_Vote_ID, Game_ID FROM User_Votes WHERE User_ID = :uid ORDER BY User_Vote_ID DESC LIMIT 1");
        $this->db->bind(":uid", $userId);
        return $this->db->single();
    }

    public function DeactivateVote(int $UserVoteId) :void
    {
        $this->db->query("UPDATE User_Votes SET Is_Active = 0 WHERE User_Vote_ID = :uv AND Real_Vote = 1");
        $this->db->bind(":uv", $UserVoteId);
        $this->db->execute();
    }

    public function DeactivateGame(int $gameId) :void
    {
        $this->db->query("UPDATE Games SET Is_Active = 0 WHERE Game_ID = :gid");
        $this->db->bind(":gid", $gameId);
        $this->db->execute();
    }
}