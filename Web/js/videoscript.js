const video = document.getElementById("video");
const recorded_v_elem = document.querySelector("#display_video");
const divvideo = document.getElementById("divvideo");
const content = document.getElementById("content");
const startRecordingSvg = document.getElementById("startRecordingSvg");

let stream = null;
let mediaRecorder = null;
let recordedblob = [];
let record_bl = null;
let translationLabel = null; // Keep track of translation label

const get_start = async () => {
  // Remove the translation label if it exists
  if (translationLabel) {
    translationLabel.remove();
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("successful access");
    video.srcObject = stream;
  } catch (error) {
    console.error("Error accessing camera:", error);
    return;
  }

  recordedblob = [];

  mediaRecorder = new MediaRecorder(video.srcObject);
  mediaRecorder.ondataavailable = (e) => {
    console.log("data is available for the media recorder");
    recordedblob.push(e.data);
  };

  mediaRecorder.start();

  setTimeout(() => {
    mediaRecorder.stop();
    const track = stream.getTracks();
    track[0].stop();
    console.log("successful stop");
  }, 3000); // Automatically stop recording after 3 seconds

  mediaRecorder.onstop = async () => {
    video.style.display = "none";
    recorded_v_elem.style.display = "block";

    const superbuffer = new Blob(recordedblob, { type: "video/mp4" });
    recorded_v_elem.src = window.URL.createObjectURL(superbuffer);
    recorded_v_elem.controls = true;

    recorded_v_elem.onloadedmetadata = () => {
      recorded_v_elem.play().catch((error) => {
        console.log("Error playing video:", error);
      });
    };

    record_bl = new Blob(recordedblob, { type: "video/mp4" });

    // Automatically send the video for translation
    const videoDataForm = new FormData();
    videoDataForm.append("video", record_bl);
    console.log(videoDataForm);

    try {
      const uploadResponse = await axios.post(
        `/api/video/upload`,
        videoDataForm
      );
      console.log(uploadResponse.data);

      const translateResponse = await axios.get(`/api/video/gettranslate`);
      console.log(translateResponse.data.translate);
      const translation = translateResponse.data.translate;
      translationLabel = document.createElement("div");
      translationLabel.setAttribute("id", "translationLabel");
      translationLabel.innerHTML = `<div><label> the translation </label></div> <br> <div>
              <label style="resize:none; background-color:#fff; color:black; border-radius: 10px; padding:10px; margin: 20px 5px;">${translation}<label></div>`;
      divvideo.appendChild(translationLabel);
    } catch (err) {
      console.log(err);
    }
  };
};

startRecordingSvg.addEventListener("click", () => {
  content.style.display = "none";
  divvideo.style.display = "block";
  recorded_v_elem.style.display = "none";
  get_start();
});
