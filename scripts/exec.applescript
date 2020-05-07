on run {jsx_code, arguments}
	set app_path to my get_app_path("Adobe Illustrator")
	if (app_path is not missing value) then
		return my exec_jsx(app_path, jsx_code, arguments)
	end if
end run

on get_major_version(version_str)
	set i to offset of "." in version_str
	return (text 1 thru (i - 1) of version_str) as number
end get_major_version

on get_app_path(app_name)
	set res to missing value
	tell application "System Events"
		try
			with timeout of 1 second
				tell process app_name
					set res to ((application file of it) as alias) as text
				end tell
			end timeout
		on error error_message number error_number
			--display dialog error_message
		end try
	end tell
	return res
end get_app_path

on exec_jsx(app_path, jsx_code, script_args)
	-- Illustratorバージョンを確認する
	tell application "System Events"
		set ai_version to my get_major_version(version of disk item app_path)
	end tell
	
	-- Illustratorでdo javascriptにてjsxを実行する
	using terms from application "Adobe Illustrator"
		tell application app_path
			activate
			set res to do javascript jsx_code with arguments script_args
		end tell
	end using terms from
	return res
end exec_jsx