// @ts-expect-error
import $ from "jquery";
import React, { useEffect, useState, createContext, useContext} from 'react';
import { Modal, Button, Form, Alert, Spinner, Table } from 'react-bootstrap';

const isLoggedIn = createContext<{
    loggedIn: boolean;
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}>({ loggedIn: false, setLoggedIn: () => {} });

const hasVotedToday = createContext<{
    votedToday: boolean;
    setVotedToday: React.Dispatch<React.SetStateAction<boolean>>;
}>({ votedToday: false, setVotedToday: () => {} });

interface GameData {
    id: number;
    name: string;
    votes: number;
}

interface GamesResponse {
  games: GameData[];
}

interface Game {
  id: number;
  name: string;
  votes: number;
}

interface GamesResponse {
  games: Game[];
}

interface AuthResponse {
  loggedIn: boolean;
}

interface VoteApiResponse {
    success: boolean;
}

interface GameRemovalResponse {
    success: boolean;
}

function GamesTable({ onShowNewGame }: { onShowNewGame: () => void }) {
    const { loggedIn } = useContext(isLoggedIn);
    const { votedToday, setVotedToday } = useContext(hasVotedToday);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [votingId, setVotingId] = useState<number | null>(null);

    const fetchGames = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await GetGamesList();
            const games = data.games;
            if (Array.isArray(games)) {
                const sortedGames = [...games].sort((a, b) => b.votes - a.votes);
                setGames(sortedGames);
            } else {
                setGames([]);
            }

        } catch (err) {
            setError(
                err instanceof Error
                ? err.message
                : "An unexpected error occurred."
            );
      } finally {
            setLoading(false);
      }
    
    };

    useEffect(() => {
        fetchGames();
    }, []);

    const handleVote = async (gameId: number) => {
        try {
            setVotingId(gameId);
            setError(null);

        const response = await $.ajax({
            url: "/Pages/VoteGame",
            method: "POST",
            dataType: "json",
            data: { gameId: gameId },
        });

        if (response === "1") {
            alert("You have already voted or added a game today. You cannot vote again until tomorrow.");
        } else {
            await SendGameVote(gameId);
        }

        // Refresh the table so the new vote count is displayed.
        setTimeout(async function()
        {
            await fetchGames();
        }, 500);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to submit your vote."
            );
        } finally {
              setVotingId(null);
        }
    };

    useEffect(() => {
        const checkVoteStatus = async () => {
            await HasUserVotedToday(setVotedToday);
        };
        void checkVoteStatus();
    }, [votedToday, setVotedToday]);

    const handleRemoveVote = async () => {
        const gameId = await RecallVote();
        await SendRecallVote(gameId);
        await fetchGames();
    };

    const handleGameRemoval = async (gameId :number, gameName :string) => {
        const confirmRemoveGame = confirm(`Are you sure you would like to remove ${gameName}`);
        if(confirmRemoveGame)
        {
            await RemoveGame(gameId);
            await SendGameRemoval(gameId);
            await fetchGames();
        }
    }

    if (loading) {
        return (
            <div className="container py-4">
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" aria-label="Loading"/>
                    <div className="mt-2">Loading games...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {loggedIn && (
                <>
                    <div className="row mb-2">
                        <div className="col">
                            <button type="button" className="btn btn-success float-start" onClick={onShowNewGame}>Add New Game</button>
                        </div>
                        <div className="col offset-lg-4">
                            <button type="button" className="btn btn-danger float-end me-2" onClick={handleRemoveVote}>Remove Vote</button>
                        </div>
                    </div>
                </>
            )}
            {error && (
                <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                    <button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={fetchGames} disabled={loading}>Try Again</button>
                </div>
            )}
            {games.length === 0 ? (
                <div className="alert alert-info text-center" role="status">No games found.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">Game</th>
                                <th scope="col">Votes</th>
                                <th scope="col">Remove</th>
                                <th scope="col" className="text-end">Vote</th>
                            </tr>
                        </thead>
                        <tbody>
                            {games.map((game) => (
                                <tr key={game.id}>
                                    <td>{game.name}</td>
                                    <td>{game.votes}</td>
                                    <td>
                                        <button type="button" className="btn btn-danger btn-sm" disabled={!loggedIn} onClick={() => handleGameRemoval(game.id, game.name)} >Remove Game</button>
                                    </td>
                                    <td className="text-end">
                                      <button type="button" className="btn btn-primary btn-sm mr-2" disabled={!loggedIn || votingId === game.id || votedToday} onClick={() => handleVote(game.id)} >
                                            {votingId === game.id ? (
                                                <>
                                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                                                  Voting...
                                                </>
                                            ) : (
                                                "Cast Vote"
                                            )}
                                      </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function DisplayNoLogin({ onShowLogin, authRefreshKey }: { onShowLogin: () => void; authRefreshKey: number }) {
    const { loggedIn, setLoggedIn } = useContext(isLoggedIn);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const checkAuth = async () => {
        try {
            setCheckingAuth(true);
            
            const response = await IsUserLoggedIn();
            setLoggedIn(response.loggedIn);
        } catch {
            // Treat an auth-check failure as not logged in.
            setLoggedIn(false);
        } finally {
            setCheckingAuth(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, [authRefreshKey]);

    if (loggedIn == false) {
        return (
            <div className="alert alert-warning alert-dismissible fade show rounded-0 m-0 border-0 border-bottom shadow-sm" role="alert">
                <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between py-1">
                    <div className="d-flex align-items-center mb-2 mb-md-0 text-center text-md-start">
                        <i className="bi bi-exclamation-triangle-fill fs-5 me-2 text-warning-emphasis"></i>
                        <div>
                            <strong>Notice:</strong> You are currently not logged in. You must log in to vote for your favorite game.
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-md-3">
                        <a className="btn btn-sm btn-dark" onClick={onShowLogin}>Log In</a>
                    </div>
                </div>
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        );
    }
    else {
        return "";
    }
}

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [votedToday, setVotedToday] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [authRefreshKey, setAuthRefreshKey] = useState(0);
    const [newGameModal, setNewGameModal] = useState(false);
    const [newGameName, setNewGameName] = useState("");

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let fd = new FormData();
        fd.append("user", loginUsername);
        fd.append("pass", loginPassword);

        $.ajax({
            url: "/Pages/LoginSubmit",
            method: "POST",
            dataType: "json",
            data: fd,
            processData: false, 
            contentType: false, 
            success: function(data: string) {
                if (data === "1") {
                    setShowLoginModal(false);
                    setLoginUsername("");
                    setLoginPassword("");
                    setAuthRefreshKey((key) => key + 1);
                } else {
                    alert("Invalid username or password.");
                    setLoginPassword("");
                }
            }
        });
    };

    const handleNewGameSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        $.ajax({
            url: "/Pages/AddGame",
            method: "POST",
            dataType: "json",
            data: { gameName: newGameName },
            success: function(data: string) {
                if (data === "1") {
                    alert("You have already voted or added a game today. You cannot add a new game until tomorrow.");
                }
                else if (data === "2") {
                    alert("A game with that name already exists. Please choose a different name.");
                }
                else if (data === "0") {
                    setNewGameModal(false);
                    SendNewGameVote(newGameName)
                }
            }
        });
    }

    return (
        <isLoggedIn.Provider value={{ loggedIn, setLoggedIn }}>
        <hasVotedToday.Provider value={{ votedToday, setVotedToday }}>
        <div className="container">
            <div className="row mt-4">
                <div className="col-md-6 offset-md-3">
                    <h1 className="text-center">Game Voting</h1>
                </div>
            </div>
            <div className="row">
                <div className="col-md-8 offset-md-2">
                    <DisplayNoLogin onShowLogin={() => setShowLoginModal(true)} authRefreshKey={authRefreshKey}/>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <GamesTable onShowNewGame={() => setNewGameModal(true)} />
                </div>
            </div>
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Game</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleLoginSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Label htmlFor="loginUsername">Username</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    id="loginUsername" 
                                    placeholder="Enter your username" 
                                    value={loginUsername}
                                    onChange={(e) => setLoginUsername(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Label htmlFor="loginPassword">Password</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    id="loginPassword" 
                                    placeholder="Enter your password" 
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-2">
                            <Button variant="primary" type="submit" className="w-100">Log In</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            <Modal show={newGameModal} onHide={() => setNewGameModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Game</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleNewGameSubmit}>
                        <div className="row">
                            <div className="col-md-6  offset-md-3 mb-3">
                                <Form.Label htmlFor="newGame">New Game Name</Form.Label>
                                <Form.Control type="text" id="newGame" placeholder="Enter new game name" value={newGameName} onChange={(e) => setNewGameName(e.target.value)} required />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-2">
                            <Button variant="primary" type="submit" className="w-100">Add Game</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
        </hasVotedToday.Provider>
        </isLoggedIn.Provider>
    );
}

function IsUserLoggedIn() {
    return $.ajax({url: "/Pages/CheckLoginStatus", method: "POST", dataType: "json"})
}

function GetGamesList() {
    return $.ajax({url: "https://codechallenge.essensedesigns.info/games/list", method: "POST", dataType: "json", data: { api_key: "ed8432f800a51abcf817b792e2fcdd32" }});
}

function SendNewGameVote(newGameName: string) {
    $.ajax({
        url: "https://codechallenge.essensedesigns.info/games/add", 
        method: "POST", 
        dataType: "json", 
        data: { api_key: "ed8432f800a51abcf817b792e2fcdd32", name: newGameName },
        success: function(data: string) {
            if (data === "-1") {
                alert("Game addition failed. Please try again later.");
            }
            else {
                window.location.reload();
            }
        }
    });
}

function SendGameVote (gameId: number) {
    $.ajax({
        url: "https://codechallenge.essensedesigns.info/games/vote",
        method: "POST",
        dataType: "json",
        data: { api_key: "ed8432f800a51abcf817b792e2fcdd32", id: gameId },
        success: function(data: string) {
            if (data === "false") {
                alert("Vote submission failed. Please try again later.");
            }
        }
    });
}

function HasUserVotedToday(setVotedToday: React.Dispatch<React.SetStateAction<boolean>>) {
    return $.ajax({
        url: "/Pages/HasUserVotedToday", 
        method: "POST", 
        dataType: "json",
        success: function (data: string)
        {
            if(data === "1")
            {
                setVotedToday(true);
            }
            else
            {
                setVotedToday(false);
            }
        }
    });
}

function RecallVote() {
    return $.ajax({url: "Pages/RecallVote", method: "POST", dataType: "json",});
}

function SendRecallVote(gameId :number)
{
    $.ajax({
        url: "https://codechallenge.essensedesigns.info/games/removeVote",
        method: "POST",
        dataType: "json",
        data: {api_key: "ed8432f800a51abcf817b792e2fcdd32", id: gameId},
        success: function (data: string) {
            return "ok";
        }
    });
}

function RemoveGame(gameId :number) {
    $.ajax({
        url: "/Pages/RemoveGame",
        method: "POST",
        dataType: "json",
        data: {gameId: gameId},
        success: function(data: string)
        {
            if(data != "ok") {
                alert("Error removing game. Please try again later.");
            }
        }
    });
}

function SendGameRemoval(gameId :number) {
    $.ajax({
        url: "https://codechallenge.essensedesigns.info/games/remove",
        method: "POST",
        dataType: "json",
        data: {api_key: "ed8432f800a51abcf817b792e2fcdd32", id: gameId},
        success: function (data :GameRemovalResponse)
        {
            if(data.success != true) {
                alert("Error removing game. Please try again later.")
            }
        }
    })
}

export default App;