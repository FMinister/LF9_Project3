import axios from "axios";
import oauth from "axios-oauth-client";
import { toast } from "react-toastify";

const config = () => ({
    headers: {
        Authorization: `Bearer ${
            JSON.parse(sessionStorage.getItem("auth")).access_token
        }`,
    },
});

export const handleLogin = async (
    username,
    password,
    currentDomain,
    navigate,
    setUser,
    setError
) => {
    const getClientCredentials = oauth.client(axios.create(), {
        url: `http://${currentDomain}:8000/api/auth/token`,
        grant_type: "",
        username: username,
        password: password,
        scope: "",
    });

    try {
        const auth = await getClientCredentials();
        sessionStorage.setItem("auth", JSON.stringify(auth));
        setUser(auth);
        navigate("/all");
    } catch (error) {
        setUser(null);
        setError(error);
    }
};

export const handleSignUp = async (
    username,
    email,
    password,
    currentDomain,
    navigate,
    setError
) => {
    const signUp = axios
        .post(`http://${currentDomain}:8000/api/auth/user`, {
            username,
            email,
            password,
        })
        .then((response) => {
            toast.success("Nutzer wurde angelegt. Ab zum Login! 😊");
            navigate("/login");
        })
        .catch((error) => {
            toast.error("Nutzer konnte nicht angelegt werden. 😞");
            setError(signUp);
            console.log(error);
        });
};

export const handleLogout = () => {
    sessionStorage.removeItem("auth");
    window.location = "/login";
};

export const getAllData = (currentDomain, setData, setIsLoading) => {
    return axios
        .get(`http://${currentDomain}:8000/api/issues/allData`, config())
        .then((response) => {
            setData(response.data);
            setIsLoading(false);
        })
        .catch((error) => {
            toast.error("Daten konnten nicht abgerufen werden. 😞");
            setIsLoading(false);
            if (error.response?.status === 401) {
                handleLogout();
            }
        });
};

export const getSingleIssue = (
    currentDomain,
    setData,
    setSolvedStatus,
    setIsLoading,
    setImages,
    id
) => {
    return axios
        .get(`http://${currentDomain}:8000/api/issues/getData/${id}`, {
            headers: {
                Authorization: `Bearer ${
                    JSON.parse(sessionStorage.getItem("auth")).access_token
                }`,
            },
        })
        .then((response) => {
            setData(response.data);
            setSolvedStatus(response.data.solved);
            return response.data;
        })
        .then((ticket) => {
            setImages([]);
            const attachments = ticket.attachments.split(", ");
            const timestamp = ticket.timestamp;

            if (attachments[0] !== "no attachments") {
                attachments.forEach((image) => {
                    const img =
                        (`http://${currentDomain}:8000/api/issues/getFiles/${timestamp}/${image}`,
                        config());
                    setImages((oldImages) => [...oldImages, img]);
                });
            }

            setIsLoading(false);
        })
        .catch((error) => {
            console.log(error);
            toast.error("Daten konnten nicht abgerufen werden. 😞");
            setIsLoading(false);
            if (error.response?.status === 401) {
                handleLogout();
            }
        });
};

export const updateSingleIssue = (
    currentDomain,
    id,
    setData,
    setSolvedStatus,
    solvedStatus
) => {
    return axios
        .patch(
            `http://${currentDomain}:8000/api/issues/updateData/${id}?update=${!solvedStatus}`,
            JSON.stringify({
                issue_id: parseInt(id),
                update: !solvedStatus,
            }),
            config()
        )
        .then((response) => {
            setData(response.data);
            setSolvedStatus(!solvedStatus);
            toast.success(
                `Neuer Ticketstatus: ${
                    !solvedStatus ? "Abgeschlossen! 🥳" : "Offen ⚙️"
                } `
            );
        })
        .catch((error) => {
            console.log(error);
            toast.error("Ticket konnte nicht bearbeitet werden. 😞");
            if (error.response?.status === 401) {
                handleLogout();
            }
        });
};

export const postIssue = (currentDomain, ticketData, navigate) => {
    return axios
        .post(
            `http://${currentDomain}:8000/api/issues/postIssue`,
            ticketData,
            config()
        )
        .then((response) => {
            toast.success("Daten erfolgreich gespeichert. 😊");
            navigate(`/tickets/${response.data.id}`);
        })
        .catch((error) => {
            toast.error("Daten konnten nicht gesendet werden. 😞");
            if (error.response?.status === 401) {
                handleLogout();
            }
        });
};
