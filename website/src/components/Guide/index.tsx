import { config } from "../../config";

function Guide() {
    return(
		<div className="guide">
			<h4>To setup captions on your stream, follow the instructions below</h4>
			<ul>
				<li>Install the <a href={config.twitch}>Twitch extension</a> (We recommend overlay slot)</li>
				<li>Select your spoken language</li>
				<li>Start captions by clicking "Start listening"</li>
				<li>Accept microphone permission if necessary, and check if correct microphone is selected</li>
				<li>Keep this window open during your stream</li>
				<li>Optional: Check other tabs for further configuration</li>
			</ul>
			<div className="help">
				If you have any issue with the extension, join the <a href={config.discord}>discord</a>&nbsp;!
			</div>
		</div>
	);
}

export default Guide;